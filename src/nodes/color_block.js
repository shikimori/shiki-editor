import { Node } from '../base';
import { nodeIsActive } from '../checks';
import { toggleNodeWrap, updateAttrs } from '../commands';

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
        tag: 'div.prosemirror-color', getAttrs: node => {
          const match = node.style.color.match(this.COLOR_REGEXP);
          return match ? { color: match[1] } : null;
        }
      }],
      toDOM: node => ['div', {
        class: 'prosemirror-size', style: `color: ${node.attrs.color};`, 'data-div': `[color=${node.attrs.color}]`
      }, 0]
    };
  }

  commands({ type }) {
    return (attrs, needToRemove = false) => {
      if (needToRemove) {
        return toggleNodeWrap(type);
      } else {
        return updateAttrs(type, attrs);
      }
    };
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  markdownSerialize(state, node) {
    state.renderBlock(node, 'color', `=${node.attrs.color}`, node.attrs.nFormat);
  }
}
