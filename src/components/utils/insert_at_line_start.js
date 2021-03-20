export default async function insertAtLineStart(
  app,
  prefix
) {
  const textarea = app.$refs.textarea;
  const content = app.editorContent;

  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;

  if (startPos === endPos) {
    if (startPos === 0) {
      replaceAtBeginning(app, prefix);
    } else {
    }
  } else {
    const selectedText = content.substring(startPos, endPos);
  }

  // app.focus();
  // await app.$nextTick();
  // 
  // textarea.scrollTop = scrollTop;
}

async function replaceAtBeginning(app, prefix) {
  const textarea = app.$refs.textarea;
  const { scrollTop } = textarea;

  app.editorContent = prefix + app.editorContent;

  app.focus();
  await app.$nextTick();

  textarea.selectionStart = prefix.length;
  textarea.selectionEnd = textarea.selectionStart;

  textarea.scrollTop = scrollTop;
}
