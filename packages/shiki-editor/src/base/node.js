import Extension from './extension';

export default class Node extends Extension {
  constructor(options = {}) {
    super(options);
  }

  get type() {
    return 'node';
  }

  get schema() {
    return null;
  }

  get view() {
    return null;
  }

  commands({ type: _type }) {
    return () => _state => {};
  }

  activeCheck({ type: _type }) {
    return false;
  }

  get markdownParserToken() {
    // NOTE:
    // "node" means that parser will expect
    //   `${node.name} tokens
    // "block" means that parser will expect
    //    `${node.name}_open` and `${node.name}_open` tokens
    return { block: this.name };
  }

  markdownSerialize(_state, _node) {
    return null;
  }

  prependBaseUrl(url) {
    return `${this.options.baseUrl}${url}`;
  }
}
