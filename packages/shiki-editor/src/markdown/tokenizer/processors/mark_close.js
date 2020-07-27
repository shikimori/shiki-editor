export default function(state, type, openBbcode, closeBbcode) {
  if (state.lastMark !== openBbcode) { return; }

  state.marksStack.pop();
  state.inlineTokens.push(
    state.tagClose(type, null, closeBbcode)
  );
  state.next(closeBbcode.length);

  return true;
}
