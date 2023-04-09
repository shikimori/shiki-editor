import sortBy from 'lodash/sortBy';

const CODE_REGEXP = /^```\w*\n[\s\S]*?^```(?=\n|$)|`.*?`|\[code(?:=\w+)?\][\s\S]*?\[\/code\]/gm;
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

const TAG_START_SEQ = '[';
const TAG_END_SEQ = ']';

export default function swapMispositionedTags(text) {
  let fixedText = text;
  const tags = parseUnbalancedTags(nullifyCodeBlocks(text));
  let openTagNames = [];

  for (let index = 0; index < tags.length; index++) {
    const tag = tags[index];

    if (!tag.isClose) {
      openTagNames.push(tag.name);
      continue;
    }
    const closeTagsSequqnce = getCloseTagsSequence(tags, index, openTagNames);

    if (closeTagsSequqnce.length > 1) {
      fixedText = swapTags(fixedText, closeTagsSequqnce, openTagNames.reverse());
      index += closeTagsSequqnce.length - 1;
    }

    openTagNames = [];
  }

  return fixedText;
}


function getCloseTagsSequence(tags, startIndex, openTagNames) {
  const endIndex = startIndex + openTagNames.length;
  const closeTagsSequence = [];

  for (let index = startIndex; index < endIndex; index++) {
    const tag = tags[index];
    const prevCloseTag = closeTagsSequence[closeTagsSequence.length - 1];

    if (!tag.isClose) { break; }
    if (!openTagNames.includes(tag.name)) { break; }
    // tag must be close to prev tag
    if (prevCloseTag && tag.index != prevCloseTag.index + prevCloseTag.text.length) {
      break;
    }

    closeTagsSequence.push(tag);
  }

  return closeTagsSequence;
}

function swapTags(text, tags, tagsOrder) {
  const reorderedTags = sortBy(tags, tag => tagsOrder.indexOf(tag.name));
  const startIndex = tags[0].index;
  const endIndex = tags[tags.length - 1].index + tags[tags.length - 1].text.length;

  const newText = text.slice(0, startIndex) +
    reorderedTags.map(tag => tag.text).join('') +
    text.slice(endIndex, text.length);

  return newText;
}

function placeholder(size) {
  let string = '';
  for (let i = 0; i < size; i++) {
    string += '*';
  }
  return string;
}

function nullifyCodeBlocks(text) {
  return text.replace(CODE_REGEXP, match => placeholder(match.length));
}

function parseUnbalancedTags(text) {
  const stack = [];

  let tagStartIndex = null;

  for (let index = 0; index < text.length; index++) {
    const char1 = text[index];

    if (char1 === TAG_START_SEQ) {
      tagStartIndex = index;
    }

    if (char1 === TAG_END_SEQ) {
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
