import Token from '../token';
import { extractMarkdownLanguage } from '../helpers';

export default function(
  state,
  startSequence,
  endSequence,
  meta,
  isStart,
  isOnlySpacingsBefore
) {
  const isMarkdown = startSequence === '```';
  let index = state.index + startSequence.length;
  let language;

  if (isMarkdown) {
    language = extractMarkdownLanguage(state.text, index);
    index += language ? language.length + 1 : 1;
  } else {
    if (meta && meta.language) {
      language = meta.language;
    }
    if (state.text[index] === '\n') {
      index += 1;
    }
  }

  const startIndex = index;
  let isEnded = false;

  while (index <= state.text.length) {
    if (state.text[index] === endSequence[0] &&
      state.text.slice(index, index + endSequence.length) === endSequence
    ) {
      isEnded = true;
      break;
    }
    index += 1;
  }
  if (!isEnded) {
    return false;
  }

  const endIndex = isMarkdown ?
    index :
    state.text[index - 1] === '\n' ? index - 1 : index;
  const text = state.text
    .slice(startIndex, endIndex)
    .replace(/\\`/g, '`');
  const languageAttr = language ? [['language', language]] : null;
  index += endSequence.length;

  if (isOnlySpacingsBefore) {
    state.inlineTokens = [];
  } else if (!isStart) {
    state.finalizeParagraph();
  }

  state.push(new Token('code_block', text, null, languageAttr));
  state.next(index - state.index, true);

  return true;
}
