import { Node } from '../base';
import { ensureDimension } from '../utils';

// NOTE: this node cannot be generated in WYSIWYG mode
export default class SizeBlock extends Node {
  SIZE_REGEXP = /^(\d+)/

  get name() {
    return 'size_block';
  }

  get schema() {
    return {
      attrs: {
        size: {},
        nBeforeOpen: { default: true },
        nAfterOpen: { default: true },
        nBeforeClose: { default: true }
      },
      content: 'block*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'div.prosemirror-size',
        getAttrs: node => {
          const match = node.style.fontSize.match(this.SIZE_REGEXP);
          return match ? { size: match[1] } : null;
        }
      }],
      toDOM: node => [
        'div',
        {
          class: 'prosemirror-size',
          style: `font-size: ${ensureDimension(node.attrs.size, 'px')};`,
          'data-div': `[size=${node.attrs.size}]`
        },
        0
      ]
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'size', `=${node.attrs.size}`, node.attrs);
  }
}
