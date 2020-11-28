import { Node } from '../base';
import { nodeIsActive } from '../checks';
import { toggleNodeWrap } from '../commands';

// NOTE: this node cannot be generated in WYSIWYG mode
export default class BoldBlock extends Node {
  get name() {
    return 'bold_block';
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

  commands({ type }) {
    return () => toggleNodeWrap(type);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'b', '', node.attrs.nFormat);
  }
}
