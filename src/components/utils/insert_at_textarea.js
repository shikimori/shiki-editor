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

  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;

  let selectedText = text.slice(startPos, endPos);
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
  const finalText = text.slice(0, startPos) +
    prefix + selectedText + postfix +
    text.slice(endPos);

  const finalPos = selectedText.length || !prefix.length ?
    startPos + prefix.length + selectedText.length + postfix.length :
    startPos + prefix.length;

  finalize(app, finalText, finalPos);
}

export function insertAtLineStart(
  app,
  prefix
) {
  const textarea = app.$refs.textarea;
  const text = app.editorContent;

  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;

  const newLinePos = indexOfNewLine(text, startPos);
  const offset = newLinePos === 0 ? 0 : 1;

  const firstPart = text.slice(0, newLinePos + offset);
  const secondPart = text.slice(newLinePos + offset);

  const newText = firstPart + prefix + secondPart;

  if (startPos === endPos) {
    finalize(app, newText, newLinePos + prefix.length);
  } else {
    const newStartPos = startPos + prefix.length;
    const newEndPos = endPos + prefix.length;
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

async function finalize(app, text, selectionStart) {
  const textarea = app.$refs.textarea;
  const { scrollTop } = textarea;

  app.editorContent = text;

  app.focus();
  await app.$nextTick();

  textarea.selectionStart = selectionStart;
  textarea.selectionEnd = selectionStart;

  textarea.scrollTop = scrollTop;
}

function indexOfNewLine(text, position) {
  let i = text[position] === '\n' ? position - 1 : position;

  for (; i > 0; i -= 1) {
    if (text[i] === '\n') {
      break;
    }
  }

  return i;
}
