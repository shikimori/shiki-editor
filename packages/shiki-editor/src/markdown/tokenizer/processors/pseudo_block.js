import { extractUntil } from '../helpers';
import processBlock from './block';

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
  const isNewLineAhead = state.text[index] === '\n';

  if (!isNewLineAhead) {
    const content = extractUntil(
      state.text,
      endSequence,
      index,
      null,
      isNewLineAhead
    );
    if (!state.PSEUDO_BLOCK_TEST_REGEXP.test(content)) { return false; }
  }

  return processBlock(
    state,
    type, startSequence, endSequence,
    meta, isStart, isOnlySpacingsBefore
  );
}
