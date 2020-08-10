import { extractUntil } from '../helpers';
import processMarkOpen from './mark_open';

import processBlock from './block';

export const PSEUDO_BLOCK_TEST_REGEXP = /\[(?:quote|div|spoiler|right|center)/;

export function processInlineOrBlock(
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
    const isLink = type === 'link';
    if (isLink) { return null; } // inline links are processed in other place

    const isProcessed = processMarkOpen(
      state,
      `${type}_inline`,
      openBbcode,
      closeBbcode,
      meta
    );

    // process as inline
    if (isProcessed) { return false; }
  } else {
    return processBlock(
      state,
      `${type}_block`, openBbcode, closeBbcode,
      meta, isStart, isOnlySpacingsBefore
    );
  }
}
