import { Mark } from '../base';

export default class Color extends Mark {
  COLOR_REGEXP = /^(#[\da-f]+|\w+)$/

  get name() {
    return 'color';
  }

  get schema() {
    return {
      attrs: {
        color: {}
      },
      parseDOM: [{
        style: 'color',
        getAttrs: value => {
          const match = value.match(this.COLOR_REGEXP);
          return match ? { color: match[1] } : null;
        }
      }],
      toDOM: (node) => [
        'span',
        { style: `color: ${node.attrs.color};` },
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
        return `[color=${mark.attrs.color}]`;
      },
      close: '[/color]',
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
}
