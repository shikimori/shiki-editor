import { extractUntil } from '../helpers';

export default function processLinkInline(state, bbcode, attrs) {
  if (attrs) {
    return processLinkStart(state, bbcode, attrs);
  } else {
    return processLinkFull(state, bbcode);
  }
}

function processLinkStart(state, bbcode, attrs) {
  const text = extractUntil(state.text, '[/url]', state.index + bbcode.length);
  if (!text) { return false; }

  state.marksStack.push('[url]');
  state.inlineTokens.push(
    state.tagOpen('link_inline', { ...attrs, text }, bbcode)
  );
  state.next(bbcode.length);

  return true;
}

function processLinkFull(state, openBbcode) {
  const closeBbcode = '[/url]';
  const url = extractUntil(
    state.text,
    closeBbcode,
    state.index + openBbcode.length
  );

  if (!url) { return false; }

  state.inlineTokens.push(
    state.tagOpen('link_inline', { url, text: url })
  );
  state.appendInlineContent(url, false);
  state.inlineTokens.push(
    state.tagClose('link_inline')
  );

  state.next(openBbcode.length + url.length + closeBbcode.length);

  return true;
}
