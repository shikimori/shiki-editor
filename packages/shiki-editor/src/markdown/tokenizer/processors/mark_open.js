import { hasInlineSequence } from '../helpers';

export default function processMarkClose(
  state,
  type,
  openBbcode,
  closeBbcode,
  attributes
) {
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
