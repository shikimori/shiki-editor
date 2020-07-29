import { Node } from '../base';

export default class Right extends Node {
  get name() {
    return 'right';
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
        tag: 'div.right-text'
      }],
      toDOM: () => [
        'div',
        {
          class: 'right-text',
          'data-div': '[right]'
        },
        0
      ]
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'right', '', node.attrs.nFormat);
  }
}
