import Token from '../token';
import { extractUntil } from '../helpers';
import { CACHE, fixedType } from '../../../extensions/shiki_loader';
import { SHIKI_BBCODE_LINK_REGEXP } from './shiki_inline';

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

  if (!text || SHIKI_BBCODE_LINK_REGEXP.test(text)) { return; }

  const sequence = `${openBbcode}${text}${closeBbcode}`;
  const tokens = state.constructor.parse(text.trim());
  const cache = CACHE?.[fixedType(meta.type)]?.[meta.id];

  if (cache) {
    const tagMeta = { url: cache.url, id: meta.id, type: meta.type };
    state.push(state.tagOpen('link_block', tagMeta), true);
    state.tokens = state.tokens.concat(tokens);
    state.push(state.tagClose('link_block'));

  } else {
    state.push(
      new Token('shiki_block', null, tokens, {
        type: meta.type,
        id: meta.id,
        bbcode: sequence,
        openBbcode,
        closeBbcode,
        isLoading: cache === undefined,
        isError: cache !== undefined
      })
    );
  }

  state.next(sequence.length);
}
