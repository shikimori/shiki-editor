const SELECT_REPLACEMENT_REGEXP = /\n(.)/g;

export default async function insertAtLineStart(
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
        SELECT_REPLACEMENT_REGEXP,
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
