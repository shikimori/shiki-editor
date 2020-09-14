export default function processHeading(state, sequence, level) {
  const tokenizer = new state.constructor(
    state.text,
    state.index + sequence.length,
    '',
    '\n'
  );
  const tokens = tokenizer.parse();

  state.push(state.tagOpen('heading', { level }));
  state.tokens = state.tokens.concat(tokens);
  state.push(state.tagClose('heading'));

  const finalIndex = tokenizer.index - state.index;
  state.next(finalIndex, true);
}
