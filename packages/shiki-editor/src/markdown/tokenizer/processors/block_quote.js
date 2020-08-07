export default function processBlockQuote(state, tagSequence) {
  let isFirstLine = true;
  state.push(state.tagOpen('blockquote'));
  state.nestedSequence += tagSequence;
  // console.log(`processBlockQuote '${state.nestedSequence}'`);

  do {
    state.parseLine(isFirstLine ? tagSequence : '');
    isFirstLine = false;
  } while (state.isSequenceContinued());

  state.push(state.tagClose('blockquote'));
  state.nestedSequence = state.nestedSequence
    .slice(0, state.nestedSequence.length - tagSequence.length);
  // console.log(`processBlockQuote '${state.nestedSequence}'`);
}
