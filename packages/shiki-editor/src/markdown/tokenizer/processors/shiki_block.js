import Token from '../token';
import { extractUntil } from '../helpers';
import { CACHE, fixedType } from '../../../extensions/shiki_loader';

export default function(state, openBbcode, closeBbcode, meta) {
  const inlineText = extractUntil(
    state.text,
    closeBbcode,
    state.index + openBbcode.length
  );
  if (inlineText) { return; }

  const text = extractUntil(
    state.text,
    closeBbcode,
    state.index + openBbcode.length,
    null,
    true
  );

  if (!text) { return; }

  const sequence = `${openBbcode}${text}${closeBbcode}`;
  const tokens = state.constructor.parse(text.trim());
  const cache = CACHE?.[fixedType(meta.type)]?.[meta.id];
  let token;

  if (cache) {
    token = new Token('link_block', null, tokens, {
      url: cache.url,
      id: meta.id,
      type: meta.type
    });
  } else {
    token = new Token('shiki_block', null, tokens, {
      type: meta.type,
      id: meta.id,
      bbcode: sequence,
      openBbcode,
      closeBbcode,
      isLoading: cache === undefined,
      isError: cache !== undefined
    });
  }

  state.push(token);
  state.next(sequence.length);
}
