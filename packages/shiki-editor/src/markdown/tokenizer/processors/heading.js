export default function(state, sequence, level) {
  state.paragraphToken = state.tagOpen('heading', { level });
  state.next(sequence.length);
}

