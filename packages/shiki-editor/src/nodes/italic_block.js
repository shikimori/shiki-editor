import { Node } from '../base';

// NOTE: this node cannot be generated in WYSIWYG mode
export default class BoldBlock extends Node {
  get name() {
    return 'italic_block';
  }

  get schema() {
    return {
      attrs: {
        nBeforeOpen: {},
        nAfterOpen: {},
        nBeforeClose: {}
      },
      content: 'block*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'div.prosemirror-italic'
      }],
      toDOM: () => [
        'div',
        {
          class: 'prosemirror-italic',
          'data-div': '[i]'
        },
        0
      ]
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'i', '', node.attrs);
  }
}
