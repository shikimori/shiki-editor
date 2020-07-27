export default function(
  state,
  type,
  startSequence,
  exitSequence,
  metaAttributes,
  isStart = true,
  isOnlySpacingsBefore = false
) {
  const nBeforeOpen = state.text[state.index - 1] === '\n';
  let index = state.index + startSequence.length;
  const nAfterOpen = state.text[index] === '\n';
  if (nAfterOpen) { index += 1; }

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
  const nBeforeClose =
    state.text[finalIndex - exitSequence.length - 1] === '\n';
  const meta = {
    ...metaAttributes, nBeforeOpen, nAfterOpen, nBeforeClose
  };

  state.push(state.tagOpen(type, meta), true);
  state.tokens = state.tokens.concat(tokens);
  state.push(state.tagClose(type));

  state.next(finalIndex, true);

  return true;
}
