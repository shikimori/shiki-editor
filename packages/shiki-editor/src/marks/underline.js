import { Mark } from '../base';

export default class Underline extends Mark {
  get name() {
    return 'underline';
  }

  get schema() {
    return {
      parseDOM: [{
        tag: 'u'
      },
      {
        style: 'text-decoration',
        getAttrs: value => value === 'underline'
      }],
      toDOM: () => ['u', 0]
    };
  }

  keys({ type }) {
    return {
      'Mod-u': (state, dispatch) => this.commands({ type })()(state, dispatch)
    };
  }

  get markdownSerializerToken() {
    return {
      open: '[u]',
      close: '[/u]',
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
}
