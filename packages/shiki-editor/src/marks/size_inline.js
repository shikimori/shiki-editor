/* eslint no-cond-assign: 0 */

import { Mark } from '../base';
import { ensureDimension, ensureOnlyStyle } from '../utils';

export default class SizeInline extends Mark {
  SIZE_REGEXP = /^(\d+)/

  get name() {
    return 'size_inline';
  }

  get schema() {
    return {
      rank: 5,
      attrs: {
        size: {}
      },
      parseDOM: [{
        tag: 'span',
        getAttrs: node => {
          if (!ensureOnlyStyle(node, 'font-size')) { return false; }

          const value = node.style.fontSize;

          let match;
          let size;

          if (match = value.match(this.SIZE_REGEXP)) {
            size = match[1];
          }

          return size ? { size } : false;
        }
      }],
      toDOM: node => [
        'span',
        {
          style: `font-size: ${ensureDimension(node.attrs.size, 'px')};`
        },
        0
      ]
    };
  }

  get markdownParserToken() {
    return {
      mark: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  get markdownSerializerToken() {
    return {
      open(_state, mark, _parent, _index) {
        return `[size=${mark.attrs.size}]`;
      },
      close: '[/size]',
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
}
