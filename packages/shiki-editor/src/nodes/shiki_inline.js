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
        bbcode: {},
        meta: { default: {} },
        text: { default: null },
        isLoading: { default: true },
        isError: { default: false }
      },
      group: 'inline'
      // content: 'inline*',
      // toDOM: node =>
      //   [
      //     'span',
      //     {
      //       'data-attrs': JSON.stringify(node.attrs)
      //     },
      //     node.attrs.bbcode
      //   ]
    };
  }

  view(options) {
    if (options.node.attrs.isLoading || options.node.attrs.isError) {
      return new ShikiInlineView(options);
    } else {
      return null;
    }
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
