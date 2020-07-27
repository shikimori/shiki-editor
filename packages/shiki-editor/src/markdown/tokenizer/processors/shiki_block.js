import Token from '../token';
import { extractUntil } from '../helpers';

export default function(state, openBbcode, closeBbcode, meta) {
  const text = extractUntil(
    state.text,
    closeBbcode,
    state.index + openBbcode.length,
    null,
    true
  );

  if (!text) { return; }
  const tokens = state.constructor.parse(text.trim());

  const tagMeta = {
    type: meta.type,
    id: meta.id,
    openBbcode,
    closeBbcode
  };

  let cache;

  state.push(
    new Token('shiki_block', null, tokens, {
      ...tagMeta,
      isLoading: cache === undefined,
      isError: cache !== undefined
    })
  );

  state.next(openBbcode.length + text.length + closeBbcode.length);
}
