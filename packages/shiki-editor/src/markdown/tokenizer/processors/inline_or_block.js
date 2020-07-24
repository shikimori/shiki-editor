import { extractUntil } from '../helpers';
import { processMarkOpen } from './mark';

import processBlock from './block';

const PSEUDO_BLOCK_TEST_REGEXP = /\[(?:quote|div|spoiler|right|center)/;

export default function(
  state,
  type,
  openBbcode,
  closeBbcode,
  meta,
  isStart,
  isOnlySpacingsBefore
) {
  const index = state.index + openBbcode.length;
  const isNewLineAhead = state.text[index] === '\n';

  const inlineSequence = isNewLineAhead ? null : extractUntil(
    state.text,
    closeBbcode,
    index
  );
  const isBlocksInSequence = inlineSequence &&
    PSEUDO_BLOCK_TEST_REGEXP.test(inlineSequence);

  if (inlineSequence && !isBlocksInSequence) {
    // process as inline
    if (processMarkOpen(state, `${type}_inline`, openBbcode, closeBbcode, meta)) {
      return false;
    }
  } else {
    return processBlock(
      state,
      `${type}_block`, openBbcode, closeBbcode,
      meta, isStart, isOnlySpacingsBefore
    );
  }
}
