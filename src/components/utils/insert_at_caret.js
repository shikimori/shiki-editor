const INLINE_REPLACEMENT_REGEXP = /\n(.|)/g;

export default async function insertAtCaret(
  app,
  prefix,
  postfix,
  isInline = false,
  filler = null
) {
  const textarea = app.$refs.textarea;
  const content = app.editorContent;

  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;

  const { scrollTop } = textarea;

  let selectedText = content.substring(startPos, endPos);
  selectedText = ((selectedText === '') && filler ? filler : selectedText);

  if (
    isInline && prefix && postfix &&
      selectedText.match(INLINE_REPLACEMENT_REGEXP)
  ) {
    selectedText = selectedText.replace(
      INLINE_REPLACEMENT_REGEXP,
      `${postfix}\n${prefix}$1`
    );
  }
  app.editorContent = content.substring(0, startPos) +
    prefix + selectedText + postfix +
    content.substring(endPos, content.length);

  app.focus();
  await app.$nextTick();

  if (selectedText.length || !prefix.length) {
    textarea.selectionEnd = startPos + prefix.length +
      selectedText.length + postfix.length;
    textarea.selectionStart = textarea.selectionEnd;
  } else {
    textarea.selectionStart = startPos + prefix.length;
    textarea.selectionEnd = textarea.selectionStart;
  }
  textarea.scrollTop = scrollTop;
}
