import { extractUntil } from '../helpers';
import processBlock from './block';

const PSEUDO_BLOCK_TEST_REGEXP = /\[(?:quote|div|spoiler|right|center)/;

export default function(
  state,
  type,
  startSequence,
  endSequence,
  meta,
  isStart,
  isOnlySpacingsBefore
) {
  const index = state.index + startSequence.length;

  const lineContent = extractUntil(
    state.text,
    endSequence,
    index
  );

  if (false && lineContent) {
    // process as inline
  } else {
    // try to process as block
    const isNewLineAhead = state.text[index] === '\n';

    if (!isNewLineAhead) {
      const content = extractUntil(
        state.text,
        endSequence,
        index,
        null,
        isNewLineAhead
      );
      if (!PSEUDO_BLOCK_TEST_REGEXP.test(content)) { return false; }
    }

    return processBlock(
      state,
      type, startSequence, endSequence,
      meta, isStart, isOnlySpacingsBefore
    );
  }
}
