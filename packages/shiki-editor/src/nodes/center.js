import { Node } from '../base';

export default class Center extends Node {
  get name() {
    return 'center';
  }

  get schema() {
    return {
      attrs: {
        nBeforeOpen: { default: true },
        nAfterOpen: { default: true },
        nBeforeClose: { default: true }
      },
      content: 'block*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'center'
      }],
      toDOM: () => ['center', { 'data-div': '[center]' }, 0]
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'center', '', node.attrs);
  }
}
