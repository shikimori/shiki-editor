// https://github.com/scrumpy/tiptap/blob/v1/packages/tiptap/src/Nodes/Text.js
import { Node } from '../base';

export default class Text extends Node {
  get name() {
    return 'text';
  }

  get schema() {
    return {
      group: 'inline'
    };
  }

  get markdownParserToken() {
    return null;
  }

  markdownSerialize(state, node) {
    if (node.marks.length) {
      state.renderInline(node); // text node has marks when it is parsed from clipboard
    } else {
      state.text(node.text);
    }
  }
}
