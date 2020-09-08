import { Node } from '../base';
import { fixUrl } from '../utils';
import { nodeIsActive } from '../checks';
import { toggleNodeWrap } from '../commands';

import {
  LABEL_TYPES,
  textToLabel
} from '../markdown/tokenizer/processors/shiki_inline';

// NOTE: this node cannot be generated in WYSIWYG mode
export default class LinkBlock extends Node {
  get name() {
    return 'link_block';
  }

  get schema() {
    return {
      attrs: {
        url: {},
        id: { default: null },
        type: { default: null },
        // meta: {
        //   default: { isMention: false }
        // },
        nFormat: {
          default: {
            nBeforeOpen: true,
            nAfterOpen: true,
            nBeforeClose: true
          }
        }
      },
      content: 'block*',
      group: 'block',
      draggable: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: node => ({
            url: node.getAttribute('href'),
            id: node.getAttribute('data-id'),
            type: node.getAttribute('data-type')
            // meta: {
            //   isMention: node.classList.contains('b-mention')
            // }
          })
        }
      ],
      toDOM: node => [
        'a',
        {
          href: fixUrl(node.attrs.url),
          'data-id': node.attrs.id,
          'data-type': node.attrs.type,
          class: 'prosemirror-block', // (node.attrs.meta.isMention ? 'b-mention' : 'b-link') +
          // rel: 'noopener noreferrer nofollow',
          target: '_blank',
          'data-link': `[url=${node.attrs.url}]`
        },
        0
      ]
    };
  }

  commands({ type }) {
    return () => toggleNodeWrap(type);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  markdownSerialize(state, node) {
    if (node.attrs.type && node.attrs.id) {
      const label = LABEL_TYPES.includes(node.attrs.type) ?
        ` ${textToLabel(node.attrs.text)}`:
        '';

      state.renderBlock(
        node,
        node.attrs.type,
        `=${node.attrs.id}${label}`,
        node.attrs.nFormat
      );
    } else {
      state.renderBlock(
        node,
        'url',
        `=${node.attrs.url}`,
        node.attrs.nFormat
      );
    }
  }
}
