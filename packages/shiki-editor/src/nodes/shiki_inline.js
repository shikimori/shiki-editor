// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/nodes/Image.js
import { Node } from '../base';
import { nodeInputRule } from '../commands';
import { ShikiInlineView } from '../node_views';
import { pasteRule } from '../commands';

import {
  SHIKI_LINK_REGEXP,
  SHIKI_IMAGE_REGEXP
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
        meta: { default: {} }, // can be used to append additional options to final node (currently used for images attributes)
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
      console.error('ShikInline node without nodeView!', options.node);
      return null;
    }
  }

  inputRules({ type }) {
    return [
      nodeInputRule(SHIKI_LINK_REGEXP, type, ([bbcode, type, id]) => (
        parseShikiBasicMeta(bbcode, type, id)
      )),
      nodeInputRule(SHIKI_IMAGE_REGEXP, type, ([bbcode, type, id, other]) => (
        parseShikiBasicMeta(bbcode, type, id, parseImageMeta(other))
      ))
    ];
  }

  pasteRules({ type }) {
    return [
      pasteRule(
        SHIKI_LINK_REGEXP,
        type,
        (bbcode, type, id) => parseShikiBasicMeta(bbcode, type, id)
      ),
      pasteRule(
        SHIKI_IMAGE_REGEXP,
        type,
        (bbcode, type, id, other) => (
          parseShikiBasicMeta(bbcode, type, id, parseImageMeta(other))
        )
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
