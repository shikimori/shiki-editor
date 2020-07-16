// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap/src/Nodes/Paragraph.js
import { setBlockType } from 'prosemirror-commands';
import { Node } from '../base';

export default class Paragraph extends Node {
  get name() {
    return 'paragraph';
  }

  get schema() {
    return {
      content: 'inline*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'p'
      }],
      toDOM: () => ['p', 0]
    };
  }

  commands({ type }) {
    return () => setBlockType(type);
  }

  markdownSerialize(state, node) {
    if (node.content.content.length) {
      state.renderInline(node);
      state.closeBlock(node);
    } else {
      if (!state.atBlank) {
        state.closeBlock(node);
      }
      state.write('\n');
    }
  }
}
