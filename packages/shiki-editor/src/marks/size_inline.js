import { Mark } from '../base';
import { ensureDimension } from '../utils';

export default class SizeInline extends Mark {
  SIZE_REGEXP = /^(\d+)/

  get name() {
    return 'size';
  }

  get schema() {
    return {
      attrs: {
        size: {}
      },
      parseDOM: [{
        style: 'font-size',
        getAttrs: value => {
          const match = value.match(this.SIZE_REGEXP);
          return match ? { size: match[1] } : null;
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
