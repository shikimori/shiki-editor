// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/nodes/Image.js
import { Node } from '../base';
import { ShikiInlineView } from '../node_views';
import { pasteRule } from '../commands';

import {
  SHIKI_LINK_REGEXP,
  SHIKI_IMAGE_REGEXP
} from '../markdown/tokenizer/processors/shiki_inline';

import {
  parseShikiBasicMeta
} from '../markdown/tokenizer/bbcode_helpers';


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

  pasteRules({ type }) {
    return [
      pasteRule(
        SHIKI_LINK_REGEXP,
        type,
        (bbcode, type, id) => parseShikiBasicMeta(bbcode, type, id)
      )
    ];
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
