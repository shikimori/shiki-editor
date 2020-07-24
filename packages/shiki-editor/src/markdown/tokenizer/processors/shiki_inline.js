import Token from '../token';
import { extractUntil } from '../helpers';
import { CACHE, fixedType } from '../../../extensions/shiki_loader';

export const SHIKI_LINK_REGEXP =
  /\[(anime|manga|ranobe|character|person)=(\d+)\]/;
export const SHIKI_LINK_FULL_REGEXP =
  /\[(anime|manga|ranobe|character|person)=(\d+)\]([^\]]+)\[\/(?:\1)\]/;
export const SHIKI_IMAGE_REGEXP = /\[(poster|image)=(\d+)(?: ([^\]]+))?\]/;

export function processShikiInline(
  state,
  startSequence,
  endSequence,
  meta
) {
  if (isImage(meta)) {
    return processShikiImage(state, startSequence, meta);
  } else {
    return processShikiLink(state, startSequence, endSequence, meta);
  }
}

function processShikiImage(state, startSequence, meta) {
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
  state.next(startSequence.length);

  return true;
}

function processShikiLink(state, startSequence, endSequence, meta) {
  let text;
  let sequence = startSequence;
  let tagMeta = { ...meta };

  if (endSequence) {
    text = extractUntil(
      state.text,
      endSequence,
      state.index + startSequence.length
    );
  }

  if (text) {
    sequence = `${startSequence}${text}${endSequence}`;
    tagMeta = { ...meta, text, bbcode: sequence };
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
    state.inlineTokens.push(new Token('text', text || cache.text));
    state.inlineTokens.push(
      state.tagClose('link_inline')
    );

  } else {
    state.inlineTokens.push(
      new Token('shiki_inline', null, null, tagMeta)
    );
  }
  state.next(sequence.length);

  return true;
}

function isImage(meta) {
  return meta.type === 'image' || meta.type === 'poster';
}
