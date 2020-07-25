// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/nodes/Image.js
import { Node } from '../base';
import { nodeInputRule } from '../commands';
import { ShikiInlineView } from '../node_views';
import { pasteRule } from '../commands';

import {
  SHIKI_BBCODE_LINK_REGEXP,
  SHIKI_BBCODE_LINK_FULL_REGEXP,
  SHIKI_BBCODE_IMAGE_REGEXP
} from '../markdown/tokenizer/processors/shiki_inline';

import {
  parseShikiBasicMeta,
  parseImageMeta
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
        openBbcode: { default: null },
        closeBbcode: { default: null },
        meta: { default: {} }, // can be used to append additional options to final node (currently used for images attributes)
        text: { default: null },
        isLoading: { default: true },
        isError: { default: false }
      },
      content: 'inline*',
      group: 'inline',
      draggable: true,
      selectable: true
      // toDOM: node => {
      //   if (node.attrs.text) {
      //     return [
      //       'span',
      //       {
      //         'data-attrs': JSON.stringify(node.attrs)
      //       },
      //       ['span', node.attrs.openBbcode],
      //       ['span', 0],
      //       ['span', node.attrs.closeBbcode]
      //     ];
      //   } else {
      //     return [
      //       'span',
      //       {
      //         'data-attrs': JSON.stringify(node.attrs)
      //       },
      //       node.attrs.bbcode
      //     ];
      //   }
      // }
    };
  }

  view(options) {
    return new ShikiInlineView(options);
  }

  inputRules({ type }) {
    return [
      nodeInputRule(SHIKI_BBCODE_LINK_REGEXP, type, ([bbcode, type, id]) => (
        parseShikiBasicMeta(bbcode, type, id)
      )),
      nodeInputRule(SHIKI_BBCODE_IMAGE_REGEXP, type, ([bbcode, type, id, other]) => (
        parseShikiBasicMeta(bbcode, type, id, parseImageMeta(other))
      ))
    ];
  }

  pasteRules({ type }) {
    return [
      pasteRule(SHIKI_BBCODE_LINK_FULL_REGEXP, type, ([bbcode, type, id, text]) => (
        {
          ...parseShikiBasicMeta(bbcode, type, id),
          text
        }
      )),
      pasteRule(SHIKI_BBCODE_LINK_REGEXP, type, ([bbcode, type, id]) => (
        parseShikiBasicMeta(bbcode, type, id)
      )),
      pasteRule(SHIKI_BBCODE_IMAGE_REGEXP, type, ([bbcode, type, id, other]) => (
        parseShikiBasicMeta(bbcode, type, id, parseImageMeta(other))
      ))
    ];
  }

  get markdownParserToken() {
    return {
      inlineNode: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.write(node.attrs.bbcode);
  }
}
