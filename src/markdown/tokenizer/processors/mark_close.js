export default function processMarkClose(state, type, openBbcode, closeBbcode) {
  // if (state.lastMark !== openBbcode) { return; }
  // state.marksStack.pop();
  const markIndex = state.marksStack.indexOf(openBbcode);
  if (markIndex == -1) { return; }

  state.marksStack.splice(markIndex, 1);
  state.inlineTokens.push(
    state.tagClose(type, closeBbcode)
  );
  state.next(closeBbcode.length);

  return true;
}
