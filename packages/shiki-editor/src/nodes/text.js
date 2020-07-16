// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap/src/Nodes/Text.js
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
    state.text(node.text);
  }
}
