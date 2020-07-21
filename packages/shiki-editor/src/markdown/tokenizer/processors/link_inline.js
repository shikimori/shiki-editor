import { hasInlineSequence } from '../helpers';

export default function(state, bbcode, attrs) {
  if (!hasInlineSequence(state.text, '[/url]', state.index)) { return false; }

  state.marksStack.push('[url]');
  state.inlineTokens.push(
    state.tagOpen('link_inline', attrs, bbcode)
  );
  state.next(bbcode.length);

  return true;
}
