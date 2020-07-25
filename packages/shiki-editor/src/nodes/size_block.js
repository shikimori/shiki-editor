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
        size: {}
      },
      content: 'block+',
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
          style: `font-size: ${ensureDimension(node.attrs.size, 'px')};`
        },
        0
      ]
    };
  }

  get markdownParserToken() {
    return {
      block: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'size', `=${node.attrs.size}`);
  }
}
