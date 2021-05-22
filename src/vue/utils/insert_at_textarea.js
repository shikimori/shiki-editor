import { set } from 'text-field-edit';

const NEWLINE_REGEXP = /\n(.)/g;
const NEWLINE_OR_END_REGEXP = /\n(.|)/g;

export function insertAtCaret(
  app,
  prefix,
  postfix,
  isInline = false,
  filler = null
) {
  const textarea = app.$refs.textarea;
  const text = app.editorContent;
  const { selectionStart, selectionEnd } = textarea;

  let selectedText = text.slice(selectionStart, selectionEnd);
  selectedText = ((selectedText === '') && filler ? filler : selectedText);

  if (
    isInline && prefix && postfix &&
      selectedText.match(NEWLINE_OR_END_REGEXP)
  ) {
    selectedText = selectedText.replace(
      NEWLINE_OR_END_REGEXP,
      `${postfix}\n${prefix}$1`
    );
  }
  const finalText = text.slice(0, selectionStart) +
    prefix + selectedText + postfix +
    text.slice(selectionEnd);

  const finalPos = selectedText.length || !prefix.length ?
    selectionStart + prefix.length + selectedText.length + postfix.length :
    selectionStart + prefix.length;

  finalize(app, finalText, finalPos);
}

export function insertAtLineStart(
  app,
  prefix
) {
  const textarea = app.$refs.textarea;
  const text = app.editorContent;
  const { selectionStart, selectionEnd } = textarea;

  const lineStartPos = indexOfLineStart(text, selectionStart);
  const firstPosOffset = lineStartPos === 0 ? 0 : 1;

  const firstPart = text.slice(0, lineStartPos + firstPosOffset);
  const secondPart = text.slice(lineStartPos + firstPosOffset);

  const newText = firstPart + prefix + secondPart;

  if (selectionStart === selectionEnd) {
    finalize(app, newText, lineStartPos + prefix.length);
  } else {
    const newStartPos = selectionStart + prefix.length;
    const newEndPos = selectionEnd + prefix.length;
    const selectedText = newText.slice(newStartPos, newEndPos);
    const replacedText = selectedText
      .replace(
        NEWLINE_REGEXP,
        `\n${prefix}$1`
      );
    const finalText = newText.slice(0, newStartPos) +
      replacedText +
      newText.slice(newStartPos + selectedText.length);

    finalize(app, finalText, newStartPos + replacedText.length);
  }
}

export function wrapLine(
  app,
  prefix,
  postfix
) {
  const textarea = app.$refs.textarea;
  const text = app.editorContent;
  const { selectionStart, selectionEnd } = textarea;

  const lineStartPos = indexOfLineStart(text, selectionStart);
  const isFirstPos = lineStartPos === 0;
  const firstPosOffset = isFirstPos ? 0 : 1;
  const fixedPrefix = prefix + '\n';

  const lineEndPos = indexOfLineEnd(text, selectionEnd) ?? text.length;
  const isLastPos = lineEndPos === text.length;
  const fixedPostfix = postfix + (isLastPos ? '' : '\n');

  const firstPart = text.slice(0, lineStartPos + firstPosOffset);
  const secondPart = text.slice(lineStartPos + firstPosOffset, lineEndPos + 1) +
    (isLastPos ? '\n' : '');
  const thirdPart = text.slice(lineEndPos + 1);

  const finalText = firstPart + fixedPrefix +
    secondPart +
    fixedPostfix + thirdPart;

  finalize(
    app,
    finalText,
    firstPart.length + fixedPrefix.length + secondPart.length - 1
  );
}

export function insertPlaceholder(app, placeholder) {
  insertAtCaret(app, '', placeholder);
}

export function replacePlaceholder(app, placeholder, replacement) {
  const textarea = app.$refs.textarea;
  const text = app.editorContent;
  const placeholderIndex = text.indexOf(placeholder);
  if (placeholderIndex === -1) { return; }

  const finalText = text.replace(placeholder, replacement);
  const { selectionStart, selectionEnd } = textarea;

  const textLengthDelta = replacement.length - placeholder.length;

  finalize(
    app,
    finalText,
    selectionStart < placeholderIndex ? selectionStart : selectionStart + textLengthDelta,
    selectionEnd < placeholderIndex ? selectionEnd : selectionEnd + textLengthDelta
  );
}

async function finalize(app, text, selectionStart, selectionEnd = selectionStart) {
  const textarea = app.$refs.textarea;
  const { scrollTop } = textarea;

  set(textarea, text);

  app.focus();
  await app.$nextTick();

  textarea.selectionStart = selectionStart;
  textarea.selectionEnd = selectionEnd;

  textarea.scrollTop = scrollTop;
}

function indexOfLineStart(text, position) {
  let i = text[position] === '\n' ? position - 1 : position;

  for (; i > 0; i -= 1) {
    if (text[i] === '\n') {
      break;
    }
  }

  return i;
}

function indexOfLineEnd(text, position) {
  let i = position;

  for (; i < text.length; i += 1) {
    if (text[i] === '\n') {
      return i;
    }
  }

  return null;
}
