import { Node } from '../base';

// NOTE: this node cannot be generated in WYSIWYG mode
export default class BoldBlock extends Node {
  get name() {
    return 'bold_block';
  }

  get schema() {
    return {
      attrs: {
        nBeforeOpen: {},
        nAfterOpen: {},
        nBeforeClose: {}
      },
      content: 'block+',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'div.prosemirror-bold'
      }],
      toDOM: () => [
        'div',
        {
          class: 'prosemirror-bold',
          'data-div': '[b]'
        },
        0
      ]
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'b', '', node.attrs);
  }
}
