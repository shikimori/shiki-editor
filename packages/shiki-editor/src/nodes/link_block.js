import { Node } from '../base';
import { fixUrl } from '../utils';
import { nodeIsActive } from '../checks';
import { toggleWrap } from '../commands';

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
        meta: {
          default: { isMention: false }
        },
        nBeforeOpen: { default: true },
        nAfterOpen: { default: true },
        nBeforeClose: { default: true }
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
          })
        }
      ],
      toDOM: node => [
        'a',
        {
          href: fixUrl(node.attrs.url),
          'data-id': node.attrs.id,
          'data-type': node.attrs.type,
          class: (node.attrs.meta.isMention ? 'b-mention' : 'b-link') +
            'prosemirror-block',
          // rel: 'noopener noreferrer nofollow',
          target: '_blank',
          'data-link': `[url=${node.attrs.url}]`
        },
        0
      ]
    };
  }

  commands({ type, schema }) {
    return () => toggleWrap(type, schema.nodes.paragraph);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  markdownSerialize(state, node) {
    if (node.attrs.type && node.attrs.id) {
      state.renderBlock(node, node.attrs.type, `=${node.attrs.id}`, node.attrs);
    } else {
      state.renderBlock(node, 'url', `=${node.attrs.url}`, node.attrs);
    }
  }
}
