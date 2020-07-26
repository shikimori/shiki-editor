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

export default class ShikiBlock extends Node {
  get name() {
    return 'shiki_inline';
  }

  get schema() {
    return {
      attrs: {
        id: {},
        type: {},
        bbcode: {},
        openBbcode: { default: null },
        closeBbcode: { default: null },
        meta: { default: {} }, // can be used to append additional options to final node (currently used for images attributes)
        isLoading: { default: true },
        isError: { default: false }
      },
      content: 'block+',
      group: 'block',
      draggable: false,
      selectable: false
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

  get markdownParserToken() {
    return {
      block: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.write(node.attrs.bbcode);
  }
}
