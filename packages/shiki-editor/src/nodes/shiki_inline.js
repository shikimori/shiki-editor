// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/nodes/Image.js
import { Node } from '../base';
import { ShikiInlineView } from '../node_views';

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
      defining: true,
      group: 'inline',
      toDOM: node =>
        [
          'span',
          {
            'data-attrs': JSON.stringify(node.attrs)
          },
          node.attrs.bbcode
        ]
    };
  }

  view(node, view, getPos, decorations) {
    return new ShikiInlineView({ node, view, getPos, decorations });
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
