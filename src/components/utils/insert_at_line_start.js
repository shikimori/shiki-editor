export default async function insertAtLineStart(
  app,
  prefix
) {
  const textarea = app.$refs.textarea;
  const content = app.editorContent;

  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;

  if (startPos === endPos) {
    const newLinePos = indexOfNewLine(content, startPos);
    const offset = newLinePos === 0 ? 0 : 1;
    const firstPart = content.slice(0, newLinePos + offset);
    const secondPart = content.slice(newLinePos + offset);

    finalize(app, firstPart + prefix + secondPart, newLinePos + prefix.length);
  } else {
    // const selectedText = content.substring(startPos, endPos);
  }

  // app.focus();
  // await app.$nextTick();

  // textarea.scrollTop = scrollTop;
}

async function finalize(app, content, selectionStart) {
  const textarea = app.$refs.textarea;
  const { scrollTop } = textarea;

  app.editorContent = content;

  app.focus();
  await app.$nextTick();

  textarea.selectionStart = selectionStart;
  textarea.selectionEnd = selectionStart;

  textarea.scrollTop = scrollTop;
}

function indexOfNewLine(content, position) {
  let i = content[position] === '\n' ? position - 1 : position;

  for (; i > 0; i -= 1) {
    if (content[i] === '\n') {
      break;
    }
  }

  return i;
}
