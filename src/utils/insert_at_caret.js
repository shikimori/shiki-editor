export default async function insertAtCaret(app, prefix, postfix, filler) {
  const textarea = app.$refs.textarea;
  const content = app.editorContent;

  if (document.selection) {
    textarea.focus();
    const sel = document.selection.createRange();
    sel.text = prefix +
      (((sel.text === '') && filler ? filler : sel.text)) +
      postfix;
    textarea.focus();

  } else if (
    textarea.selectionStart ||
    (textarea.selectionStart === '0') ||
    (textarea.selectionStart === 0)
  ) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const { scrollTop } = textarea;
    let selectedText = content.substring(startPos, endPos);
    selectedText = ((selectedText === '') && filler ? filler : selectedText);

    app.editorContent = content.substring(0, startPos) +
      prefix + selectedText + postfix +
      content.substring(endPos, content.length);

    await app.$nextTick();
    app.focus();

    textarea.selectionEnd = startPos + prefix.length + selectedText.length + postfix.length;
    textarea.selectionStart = textarea.selectionEnd;
    textarea.scrollTop = scrollTop;

  } else {
    app.editorContent += prefix + postfix;
    app.focus();
  }
}
