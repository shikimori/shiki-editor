import Token from '../token';
import { extractUntil } from '../helpers';
import { parseImageMeta } from '../bbcode_helpers';

export default function(state, tagStart, tagEnd, isPoster) {
  const index = state.index + tagStart.length;
  const metaAttributes =
    parseImageMeta(tagStart.slice(4, tagStart.length - 1).trim());

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

