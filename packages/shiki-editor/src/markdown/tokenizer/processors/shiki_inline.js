import Token from '../token';
import { extractUntil } from '../helpers';
import { CACHE, convertToShikiType } from '../../../extensions/shiki_loader';

export const SHIKI_BBCODE_LINK_REGEXP =
  /\[(anime|manga|ranobe|character|person|comment|topic|entry|message|user)=(\d+)(?: [^\n\][]+)?\]/;
export const SHIKI_BBCODE_LINK_FULL_REGEXP =
  /\[(anime|manga|ranobe|character|person|comment|topic|entry|message|user)=(\d+)(?: [^\n\][]+)?\]([^[]+)\[\/(?:\1)\]/;
export const SHIKI_BBCODE_IMAGE_REGEXP = /\[(poster|image)=(\d+)(?: ([^\]]+))?\]/;

export const URL_REGEXP = /\[url(?:=([^\]]+))?\]/;

export const LABEL_TYPES = ['anime', 'manga', 'ranobe', 'character', 'person'];
export const MENTION_TYPES = ['comment', 'topic', 'entry', 'message', 'user'];

export function processShikiInline(state, openBbcode, closeBbcode, meta) {
  if (meta.type === 'image' || meta.type === 'poster') {
    return processShikiImage(state, openBbcode, meta);
  } else {
    return processShikiLink(state, openBbcode, closeBbcode, meta);
  }
}

function processShikiImage(state, openBbcode, meta) {
  const cache = CACHE?.[convertToShikiType(meta.type)]?.[meta.id];

  if (cache) {
    state.inlineTokens.push(
      new Token('image', null, null, {
        id: meta.id,
        src: cache.url,
        isPoster: meta.type === 'poster',
        ...meta.meta
      })
    );
  } else {
    state.inlineTokens.push(
      new Token('shiki_inline', null, null, { ...meta })
    );
  }
  state.next(openBbcode.length);

  return true;
}

function processShikiLink(state, openBbcode, closeBbcode, meta) {
  let text;
  let sequence = openBbcode;
  let attributes = { ...meta };
  let children = null;

  if (closeBbcode) {
    text = extractUntil(
      state.text,
      closeBbcode,
      state.index + openBbcode.length
    );
    if (SHIKI_BBCODE_LINK_REGEXP.test(text) || URL_REGEXP.test(text)) {
      text = null;
    }
  }

  if (text) {
    sequence = `${openBbcode}${text}${closeBbcode}`;

    attributes = {
      ...meta,
      bbcode: sequence,
      openBbcode,
      closeBbcode,
      text
    };

    const tokens = state.constructor.parse(text);

    if (tokens.length !== 3 || tokens[1].type !== 'inline') { return; }
    children = tokens[1].children;
  }

  const cache = CACHE?.[convertToShikiType(meta.type)]?.[meta.id];

  if (cache) {
    state.inlineTokens.push(
      state.tagOpen('link_inline', {
        ...attributes,
        url: cache.url,
        text: cache.text
      })
    );
    if (children) {
      state.inlineTokens.push(...children);
    } else {
      state.inlineTokens.push(new Token('text', cache.text));
    }
    state.inlineTokens.push(
      state.tagClose('link_inline')
    );
  } else {
    state.inlineTokens.push(
      new Token('shiki_inline', null, children, {
        ...attributes,
        isLoading: cache === undefined,
        isError: cache === null
      })
    );
  }
  state.next(sequence.length);

  return true;
}

export function bbcodeLabel(attrs) {
  if (!LABEL_TYPES.includes(attrs.type) || !attrs.text) {
    return '';
  }

  let label = attrs.text
    .toLowerCase()
    .replace(/ +/g, '-')
    .replace(/[[\]]/g, '')
    .slice(0, 75);

  return ` ${label}`;
}
