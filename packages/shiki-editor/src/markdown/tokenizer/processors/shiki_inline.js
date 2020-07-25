import Token from '../token';
import { extractUntil } from '../helpers';
import { CACHE, fixedType } from '../../../extensions/shiki_loader';

export const SHIKI_BBCODE_LINK_REGEXP =
  /\[(anime|manga|ranobe|character|person)=(\d+)\]/;
export const SHIKI_BBCODE_LINK_FULL_REGEXP =
  /\[(anime|manga|ranobe|character|person)=(\d+)\]([^\]]+)\[\/(?:\1)\]/;
export const SHIKI_BBCODE_IMAGE_REGEXP = /\[(poster|image)=(\d+)(?: ([^\]]+))?\]/;

export function processShikiInline(
  state,
  openBbcode,
  closeBbcode,
  meta
) {
  if (isImage(meta)) {
    return processShikiImage(state, openBbcode, meta);
  } else {
    return processShikiLink(state, openBbcode, closeBbcode, meta);
  }
}

function processShikiImage(state, openBbcode, meta) {
  const cache = CACHE?.[fixedType(meta.type)]?.[meta.id];

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
  let tagMeta = { ...meta };
  let children = null;

  if (closeBbcode) {
    text = extractUntil(
      state.text,
      closeBbcode,
      state.index + openBbcode.length
    );
  }

  if (text) {
    sequence = `${openBbcode}${text}${closeBbcode}`;

    tagMeta = {
      ...meta,
      bbcode: sequence,
      openBbcode,
      closeBbcode,
      text
    };

    const tokenizer = new state.constructor(
      state.text,
      state.index + openBbcode.length,
      null,
      closeBbcode
    );
    const tokens = tokenizer.parse();

    if (tokens.length !== 3 || tokens[1].type !== 'inline') { return; }
    children = tokens[1].children;
  }

  const cache = CACHE?.[fixedType(meta.type)]?.[meta.id];

  if (cache) {
    state.inlineTokens.push(
      state.tagOpen('link_inline', {
        url: cache.url,
        id: meta.id,
        type: meta.type,
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
      new Token('shiki_inline', null, children, tagMeta)
    );
  }
  state.next(sequence.length);

  return true;
}

function isImage(meta) {
  return meta.type === 'image' || meta.type === 'poster';
}
