export default function(
  state,
  type,
  startSequence,
  exitSequence,
  metaAttributes,
  isStart = true,
  isOnlySpacingsBefore = false
) {
  let index = state.index + startSequence.length;
  if (state.text[index] === '\n') { index += 1; }

  const tokenizer = new state.constructor(
    state.text,
    index,
    state.nestedSequence,
    exitSequence
  );
  const tokens = tokenizer.parse();

  if (!tokens) { return; }

  if (isOnlySpacingsBefore) {
    state.inlineTokens = [];
  } else if (!isStart) {
    state.finalizeParagraph();
  }

  state.next(startSequence.length);
  state.push(state.tagOpen(type, metaAttributes), true);

  state.tokens = state.tokens.concat(tokens);
  state.index = tokenizer.index;

  state.next(exitSequence.length, true);
  state.push(state.tagClose(type));

  return true;
}
