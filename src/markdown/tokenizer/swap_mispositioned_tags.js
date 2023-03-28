export default class SwapMispositionedTags {
  static parse(text) {
    // console.log(new MarkdownTokenizer(text, 0).parse());
    return new SwapMispositionedTags(text).parse();
  }

  constructor(text) {
    this.text = text;
  }

  parse() {
    const tags = this.parseTags();

    console.log(tags);

    return this.text;
  }

  parseTags() {
    const stack = [];
    let tagStartIndex = null;

    for (let index = 0; index < this.text.length; index++) {
      const char1 = this.text[index];

      if (char1 === '[') {
        tagStartIndex = index;
        continue;
      }
      if (char1 === ']') {
        stack.push(this.buildTag(tagStartIndex, index));
        tagStartIndex = null;
        continue;
      }
    }

    return stack;
  }

  buildTag(tagStartIndex, tagEndIndex) {
    const isTagClose = this.text[tagStartIndex + 1] == '/';
    const text = this.text.slice(tagStartIndex, tagEndIndex + 1);
    const tag = text.slice(1 + (isTagClose ? 1 : 0), text.length - 1);

    return {
      tag,
      text,
      index: tagStartIndex,
      size: text.length,
      isTagClose
    };
  }
}
