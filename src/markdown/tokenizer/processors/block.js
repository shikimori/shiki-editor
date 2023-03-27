export default function(
  state,
  type,
  startSequence,
  exitSequence,
  metaAttributes,
  isStart = true,
  isOnlySpacingsBefore = false
) {
  const nIndex = state.index - state.nestedSequence.length - 1;
  const nFormat = {
    nBeforeOpen: state.text[nIndex] === '\n'
  };
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
  // console.log(tokens)

  if (!tokens) { return; }

  if (isOnlySpacingsBefore) {
    state.inlineTokens = [];
  } else if (!isStart) {
    state.finalizeParagraph(false);
  }

  const finalIndex = tokenizer.index - state.index + exitSequence.length;
  nFormat.nBeforeClose =
    state.text[nIndex + finalIndex - exitSequence.length] === '\n';
  const attrs = {
    ...metaAttributes, nFormat
  };

  state.push(state.tagOpen(type, attrs));
  state.tokens = state.tokens.concat(tokens);
  state.push(state.tagClose(type));

  state.next(finalIndex, true);

  return true;
}
