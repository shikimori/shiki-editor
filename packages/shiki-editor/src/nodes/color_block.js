import { Node } from '../base';

// NOTE: this node cannot be generated in WYSIWYG mode
export default class ColorBlock extends Node {
  COLOR_REGEXP = /^(#[\da-f]+|\w+)$/

  get name() {
    return 'color_block';
  }

  get schema() {
    return {
      attrs: {
        color: {},
        nBeforeOpen: {},
        nAfterOpen: {},
        nBeforeClose: {}
      },
      content: 'block*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'div.prosemirror-color',
        getAttrs: node => {
          const match = node.style.color.match(this.COLOR_REGEXP);
          return match ? { color: match[1] } : null;
        }
      }],
      toDOM: node => [
        'div',
        {
          class: 'prosemirror-size',
          style: `color: ${node.attrs.color};`,
          'data-div': `[color=${node.attrs.color}]`
        },
        0
      ]
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'color', `=${node.attrs.color}`, node.attrs);
  }
}
