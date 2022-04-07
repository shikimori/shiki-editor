/* eslint no-cond-assign: 0 */

import { Mark } from '../base';
import { rgbToHex, ensureOnlyStyle } from '../utils';
import { toggleMarkWrap } from '../commands';

export default class ColorInline extends Mark {
  SIMPLE_COLOR_REGEXP = /^(#[\da-f]+|\w+)$/
  RGB_COLOR_REGEXP = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/

  get name() {
    return 'color_inline';
  }

  get schema() {
    return {
      rank: 5,
      attrs: {
        color: {}
      },
      parseDOM: [{
        tag: 'span', getAttrs: node => {
          if (!ensureOnlyStyle(node, 'color')) {
            return false;
          }

          const value = node.style.color;

          let match;
          let color;

          if (this.SIMPLE_COLOR_REGEXP.test(value)) {
            match = value.match(this.SIMPLE_COLOR_REGEXP);
            color = match[1];
          } else if (this.RGB_COLOR_REGEXP.test(value)) {
            match = value.match(this.RGB_COLOR_REGEXP);
            color = rgbToHex(match[1], match[2], match[3]);
          }

          return color ? { color } : false;
        }
      }], toDOM: node => ['span', { style: `color: ${node.attrs.color};` }, 0]
    };
  }

  commands({ type }) {
    return (attrs) => toggleMarkWrap(type, attrs);
  }

  get markdownParserToken() {
    return {
      mark: this.name, getAttrs: token => token.serializeAttributes()
    };
  }

  get markdownSerializerToken() {
    return {
      open(_state, mark, _parent, _index) {
        return `[color=${mark.attrs.color}]`;
      }, close: '[/color]', mixable: true, expelEnclosingWhitespace: true
    };
  }
}
