import { extractUntil } from '../helpers';
import { parseQuoteMeta } from '../bbcode_helpers';

export default function processBlockQuote(state, tagSequence) {
  if (tagSequence === '>?') {
    const metaText = extractUntil(
      state.text,
      '\n',
      state.index + tagSequence.length
    );
    const attributes = parseQuoteMeta(metaText);

    const fromIndex = state.index + tagSequence.length +
      metaText.length + 1 /* new line */ + state.nestedSequence.length;
    const toIndex = fromIndex + tagSequence.length;
    const nextTagSequence = state.text.slice(fromIndex, toIndex);

    if (nextTagSequence === '> ') {
      state.next(
        tagSequence.length + metaText.length + 1 + state.nestedSequence.length,
        true
      );
      return processBlockQuoteContent(state, nextTagSequence, attributes);
    } else {
      return false;
    }
  }

  return processBlockQuoteContent(state, tagSequence);
}

function processBlockQuoteContent(state, tagSequence, attributes) {
  let isFirstLine = true;

  state.push(state.tagOpen('blockquote', attributes));
  state.nestedSequence += tagSequence;

  do {
    state.parseLine(isFirstLine ? tagSequence : '');
    isFirstLine = false;
  } while (state.isSequenceContinued());

  state.push(state.tagClose('blockquote'));
  state.nestedSequence = state.nestedSequence
    .slice(0, state.nestedSequence.length - tagSequence.length);

  return true;
}
