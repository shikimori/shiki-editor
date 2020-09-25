import Token from '../token';
import { extractUntil } from '../helpers';

export default function processVideo(state, tagStart, tagEnd) {
  const index = state.index + tagStart.length;
  const url = extractUntil(state.text, tagEnd, index, index + 255);

  if (url) {
    const bbcode = `${tagStart}${url}${tagEnd}`;

    state.inlineTokens.push(
      new Token(
        'video',
        null,
        null,
        { url, bbcode }
      )
    );
    state.next(bbcode.length);
    return true;
  }

  return false;
}

