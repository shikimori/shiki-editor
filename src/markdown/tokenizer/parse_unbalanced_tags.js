const PROCESSABLE_TAGS = [
  'b',
  'i',
  'u',
  's',
  'size',
  'color',
  'url',
  'span',
  'div',
  'quote',
  'spoiler',
  'center',
  'left',
  'right'
];
const CODE_INLINE = '`';

export default function parseUnbalancedTags(text) {
  const stack = [];

  let tagStartIndex = null;
  // let isNewLine = true;
  let isCode = false;
  let codeStartTag = null;
  let codeStartIndex = null;

  for (let index = 0; index < text.length; index++) {
    const char1 = text[index];
    const isEndIndex = index == text.length - 1;
    const isNewLineNext = text[index + 1] === '\n';

    if (char1 === CODE_INLINE) {
      if (isCode) {
        isCode = false;
        codeStartTag = null;
        codeStartIndex = null;
      } else {
        isCode = true;
        codeStartTag = CODE_INLINE;
        codeStartIndex = index;
      }
    }

    if (isCode) {
      if (isEndIndex || (isNewLineNext && codeStartTag === CODE_INLINE)) {
        index = codeStartIndex + codeStartTag.length - 1;
        isCode = false;
        continue;
      }

      continue;
    }

    if (char1 === '[') {
      tagStartIndex = index;
    }

    if (char1 === ']') {
      const tag = buildTag(text, tagStartIndex, index);
      if (!tag) { continue; }

      tagStartIndex = null;

      if (isClosing(tag, stack[stack.length - 1])) {
        stack.pop();
      } else {
        stack.push(tag);
      }
    }
  }

  return stack;
}

function buildTag(allText, tagStartIndex, tagEndIndex) {
  const isClose = allText[tagStartIndex + 1] == '/';
  const text = allText.slice(tagStartIndex, tagEndIndex + 1);
  const name = text.slice(1 + (isClose ? 1 : 0), text.length - 1).split('=')[0];

  if (!PROCESSABLE_TAGS.includes(name)) { return null; }

  return {
    name,
    text,
    index: tagStartIndex,
    size: allText.length,
    isClose
  };
}

function isClosing(tag, prevTag) {
  return prevTag &&
    tag.name === prevTag.name &&
    tag.isClose && !prevTag.isClose;
}
