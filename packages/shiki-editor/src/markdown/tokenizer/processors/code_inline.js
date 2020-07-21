import Token from '../token';
import { extractUntil } from '../helpers';

export default function(state, startSequence, endSequence) {
  if (!endSequence) {
    let index = state.index + 1;
    let tag = startSequence;
    let isFirstSymbolPassed = false;

    while (index <= state.text.length) {
      const char = state.text[index];
      const isEnd = char === '\n' || char === undefined;

      if (!isFirstSymbolPassed) {
        if (char === '`') {
          tag += '`';
        } else {
          isFirstSymbolPassed = true;
          break;
        }
      }

      if (isEnd) {
        return false;
      }

      index += 1;
    }
    startSequence = tag; // eslint-disable-line no-param-reassign
    endSequence = tag; // eslint-disable-line no-param-reassign
  }

  const startIndex = state.index + startSequence.length;
  const code = extractUntil(state.text, endSequence, startIndex);
  if (code) {
    state.inlineTokens.push(
      new Token('code_inline', code)
    );
    state.next(code.length + startSequence.length + endSequence.length);
    return true;
  }

  return false;
}

