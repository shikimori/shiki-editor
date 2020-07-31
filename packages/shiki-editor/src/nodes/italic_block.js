import { Node } from '../base';
import { nodeIsActive } from '../checks';
import { toggleWrap } from '../commands';

// NOTE: this node cannot be generated in WYSIWYG mode
export default class BoldBlock extends Node {
  get name() {
    return 'italic_block';
  }

  get schema() {
    return {
      attrs: {
        nFormat: {
          default: {
            nBeforeOpen: true,
            nAfterOpen: true,
            nBeforeClose: true
          }
        }
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

  commands({ type, schema }) {
    return () => toggleWrap(type, schema.nodes.paragraph);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'i', '', node.attrs.nFormat);
  }
}
