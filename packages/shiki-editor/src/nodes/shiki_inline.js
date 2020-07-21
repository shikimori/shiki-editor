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
        text: {},
        bbcode: {}
      },
      group: 'inline',
      draggable: false,
      // parseDOM: [{
      //   tag: '.b-image',
      //   getAttrs: node => JSON.parse(node.getAttribute('data-attrs'))
      // }, {
      //   tag: 'img.b-poster',
      //   getAttrs: node => ({ src: node.src, isPoster: true })
      // }],
      toDOM: node =>
        [
          'span',
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
