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
  const offset = lineStartPos === 0 ? 0 : 1;

  const firstPart = text.slice(0, lineStartPos + offset);
  const secondPart = text.slice(lineStartPos + offset);

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

  if (selectionStart === selectionEnd) {
    const lineEndPos = indexOfLineEnd(text, selectionStart);
    const offset = lineStartPos === 0 ? 0 : 1;

    if (lineEndPos) {
      const fixedPrefix = prefix + '\n';
      const fixedPostfix = postfix + '\n';

      const firstPart = text.slice(0, lineStartPos + offset);
      const secondPart = text.slice(lineStartPos + offset, lineEndPos + 1);
      const thirdPart = text.slice(lineEndPos + 1);

      const finalText = firstPart + fixedPrefix +
        secondPart +
        fixedPostfix + thirdPart;

      console.log({ firstPart, secondPart, thirdPart, finalText });
      finalize(
        app,
        finalText,
        firstPart.length + fixedPrefix.length + secondPart.length - 1
      );
    }
  } else {
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