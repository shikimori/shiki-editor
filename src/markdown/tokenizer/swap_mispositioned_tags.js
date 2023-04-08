import sortBy from 'lodash/sortBy';

export default function swapMispositionedTags(text) {
  let fixedText = text;
  const tags = parseUnbalancedTags(text);
  let openTagNames = [];
  // console.log(tags);

  for (let index = 0; index < tags.length; index++) {
    const tag = tags[index];
    // console.log(tag);

    if (!tag.isClose) {
      openTagNames.push(tag.name);
      continue;
    }
    const closeTagsSequqnce = getCloseTagsSequence(tags, index, openTagNames);
    // console.log({ closeTagsSequqnce });

    if (closeTagsSequqnce.length > 1) {
      fixedText = swapTags(fixedText, closeTagsSequqnce, openTagNames.reverse());
      index += closeTagsSequqnce.length - 1;
    }

    openTagNames = [];
  }

  // console.log({ fixedText });
  return fixedText;
}

function parseUnbalancedTags(text) {
  const stack = [];
  let tagStartIndex = null;

  for (let index = 0; index < text.length; index++) {
    const char1 = text[index];

    if (char1 === '[') {
      tagStartIndex = index;
    }

    if (char1 === ']') {
      const tag = buildTag(text, tagStartIndex, index);
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
  // console.log('swapTags', { text, tags, tagsOrder });

  const reorderedTags = sortBy(tags, tag => tagsOrder.indexOf(tag.name));
  const startIndex = tags[0].index;
  const endIndex = tags[tags.length - 1].index + tags[tags.length - 1].text.length;

  const newText = text.slice(0, startIndex) +
    reorderedTags.map(tag => tag.text).join('') +
    text.slice(endIndex, text.length);

  return newText;
}
