export default function(
  state,
  type,
  startSequence,
  exitSequence,
  metaAttributes,
  isStart = true,
  isOnlySpacingsBefore = false
) {
  const nFormat = {
    nBeforeOpen: state.text[state.index - 1] === '\n'
  }
  let index = state.index + startSequence.length;
  nFormat.nAfterOpen = state.text[index] === '\n';
  if (nFormat.nAfterOpen) { index += 1; }

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

  const finalIndex = tokenizer.index - state.index + exitSequence.length;
  nFormat.nBeforeClose =
    state.text[state.index + finalIndex - exitSequence.length - 1] === '\n';
  const attrs = {
    ...metaAttributes, nFormat
  };

  state.push(state.tagOpen(type, attrs), true);
  state.tokens = state.tokens.concat(tokens);
  state.push(state.tagClose(type));

  state.next(finalIndex, true);

  return true;
}
