export default function(state, tagSequence) {
  let isFirstLine = true;
  state.push(state.tagOpen('blockquote'));
  state.nestedSequence += tagSequence;

  do {
    state.parseLine(isFirstLine ? tagSequence : '');
    isFirstLine = false;
  } while (state.isSequenceContinued());

  state.push(state.tagClose('blockquote'));
  state.nestedSequence = state.nestedSequence
    .slice(0, state.nestedSequence.length - tagSequence.length);
}

