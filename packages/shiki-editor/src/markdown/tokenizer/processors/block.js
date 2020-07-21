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

  const innerstate = new state.constructor(
    state.text,
    index,
    state.nestedSequence,
    exitSequence
  );
  const tokens = innerstate.parse();

  if (!tokens) { return false; }

  if (isOnlySpacingsBefore) {
    state.inlineTokens = [];
  } else if (!isStart) {
    state.finalizeParagraph();
  }

  state.next(startSequence.length);
  state.push(state.tagOpen(type, metaAttributes), true);

  state.tokens = state.tokens.concat(tokens);
  state.index = innerstate.index;

  state.next(exitSequence.length, true);
  state.push(state.tagClose(type));

  return true;
}
