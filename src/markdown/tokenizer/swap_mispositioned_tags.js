import sortBy from 'lodash/sortBy';
import parseUnbalancedTags from './parse_unbalanced_tags';

export default function swapMispositionedTags(text) {
  let fixedText = text;
  const tags = parseUnbalancedTags(text);
  let openTagNames = [];
  // console.log({ tags });

  for (let index = 0; index < tags.length; index++) {
    const tag = tags[index];
    // console.log({ tag });

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
