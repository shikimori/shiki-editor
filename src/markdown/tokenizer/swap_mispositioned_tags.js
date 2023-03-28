export default class SwapMispositionedTags {
  static parse(text) {
    // console.log(new MarkdownTokenizer(text, 0).parse());
    return new SwapMispositionedTags(text).parse();
  }

  constructor(text) {
    this.text = text;
  }

  parse() {
    const tags = this.parseUnbalancedTags();

    console.log(tags);

    return this.text;
  }

  parseUnbalancedTags() {
    const stack = [];
    let tagStartIndex = null;

    for (let index = 0; index < this.text.length; index++) {
      const char1 = this.text[index];

      if (char1 === '[') {
        tagStartIndex = index;
      }

      if (char1 === ']') {
        const tag = buildTag(this.text, tagStartIndex, index);
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
}

function buildTag(allText, tagStartIndex, tagEndIndex) {
  const isClose = allText[tagStartIndex + 1] == '/';
  const text = allText.slice(tagStartIndex, tagEndIndex + 1);
  const tag = text.slice(1 + (isClose ? 1 : 0), text.length - 1);

  return {
    tag,
    text,
    index: tagStartIndex,
    size: allText.length,
    isClose
  };
}

function isClosing(tag, prevTag) {
  return prevTag &&
    tag.tag === prevTag.tag &&
    tag.isClose && !prevTag.isClose;
}
