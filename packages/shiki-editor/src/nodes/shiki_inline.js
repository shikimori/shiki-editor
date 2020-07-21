// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/nodes/Image.js
import { Node } from '../base';

export default class ShikiInline extends Node {
  get name() {
    return 'shiki_inline';
  }

  get schema() {
    return {
      inline: true,
      attrs: {
        id: {},
        type: {},
        text: { default: null },
        bbcode: {}
      },
      group: 'inline',
      draggable: false,
      toDOM: node =>
        [
          'span',
          {
            'data-attrs': JSON.stringify(node.attrs),
            class: 'b-ajax vk-like'
          },
          node.attrs.bbcode
        ]
    };
  }

  get markdownParserToken() {
    return {
      node: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.write(node.attrs.bbcode);
  }
}
