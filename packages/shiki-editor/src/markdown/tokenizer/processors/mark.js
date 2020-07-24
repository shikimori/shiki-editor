import { hasInlineSequence } from '../helpers';

export function processMarkOpen(state, type, openBbcode, closeBbcode, attributes) {
  const isCloseBbcode =
    hasInlineSequence(state.text, closeBbcode, state.index + openBbcode.length);
  if (!isCloseBbcode) { return; }

  state.marksStack.push(state.MARK_STACK_MAPPINGS[type] || openBbcode);
  state.inlineTokens.push(
    state.tagOpen(type, attributes, openBbcode)
  );
  state.next(openBbcode.length);

  return true;
}

export function processMarkClose(state, type, openBbcode, closeBbcode) {
  if (state.lastMark !== openBbcode) { return; }

  state.marksStack.pop();
  state.inlineTokens.push(
    state.tagClose(type, closeBbcode)
  );
  state.next(closeBbcode.length);

  return true;
}
