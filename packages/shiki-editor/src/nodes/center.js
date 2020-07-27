import { Node } from '../base';

export default class Center extends Node {
  get name() {
    return 'center';
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
        tag: 'center'
      }],
      toDOM: () => ['center', { 'data-div': '[center]' }, 0]
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'center', '', node.attrs);
  }
}
