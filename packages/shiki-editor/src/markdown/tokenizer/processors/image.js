import Token from '../token';
import { extractUntil } from '../helpers';

export default function(state, tagStart, tagEnd, isPoster, metaAttributes) {
  const index = state.index + tagStart.length;

  const src = extractUntil(state.text, tagEnd, index, index + 255);

  if (src) {
    state.inlineTokens.push(
      new Token(
        'image',
        null,
        null,
        {
          src,
          isPoster,
          ...(metaAttributes || {})
        }
      )
    );
    state.next(src.length + tagStart.length + tagEnd.length);
    return true;
  }

  return false;
}

