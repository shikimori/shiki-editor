export default function(
  state,
  type,
  startSequence,
  exitSequence,
  metaAttributes,
  isStart = true,
  isOnlySpacingsBefore = false
) {
  const nBeforeOpen = state.text[state.index] === '\n';
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
  const nAfterClose = state.text[finalIndex + 1] === '\n';
  const nMeta = { nBeforeOpen, nAfterOpen, nBeforeClose, nAfterClose };
  const meta = { ...metaAttributes, ...nMeta };

  state.push(state.tagOpen(type, meta), true);
  state.tokens = state.tokens.concat(tokens);
  state.push(state.tagClose(type, nMeta));

  state.next(finalIndex, true);

  return true;
}
