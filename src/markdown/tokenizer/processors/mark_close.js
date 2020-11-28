export default function processMarkOpen(state, type, openBbcode, closeBbcode) {
  if (state.lastMark !== openBbcode) { return; }

  state.marksStack.pop();
  state.inlineTokens.push(
    state.tagClose(type, closeBbcode)
  );
  state.next(closeBbcode.length);

  return true;
}
