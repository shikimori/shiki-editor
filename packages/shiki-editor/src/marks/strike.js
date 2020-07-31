import { Mark } from '../base';

export default class Strike extends Mark {
  get name() {
    return 'strike';
  }

  get schema() {
    return {
      parseDOM: [{
        tag: 'del'
      }, {
        tag: 'strike'
      }, {
        style: 'text-decoration',
        getAttrs: value => value === 'line-through'
      }],
      toDOM: () => ['del', 0]
    };
  }

  get markdownSerializerToken() {
    return {
      open: '[s]',
      close: '[/s]',
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
}
