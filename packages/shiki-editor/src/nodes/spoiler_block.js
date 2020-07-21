import { Node } from '../base';
import { nodeIsActive } from '../checks';
import { toggleWrap } from '../commands';
import { SpoilerBlockView } from '../node_views';

export default class SpoilerBlock extends Node {
  get name() {
    return 'spoiler_block';
  }

  get schema() {
    return {
      content: 'block+',
      group: 'block',
      defining: true,
      draggable: false,
      attrs: {
        label: { default: window.I18n.t('frontend.shiki_editor.spoiler') },
        isOpened: { default: true }
      },
      parseDOM: [{
        tag: 'div.b-spoiler_block',
        getAttrs: node => ({
          label: node.children[0].innerText || '',
          isOpened: node.classList.contains('is-opened')
        }),
        contentElement: node => node.children[1]
      }],
      toDOM(node) {
        return [
          'div',
          {
            class: `b-spoiler_block${node.attrs.isOpened ? ' is-opened' : ''}`
          },
          ['button', node.attrs.label],
          ['div', 0]
        ];
      }
    };
  }

  view({ node, view, getPos, decorations }) {
    return new SpoilerBlockView({ node, view, getPos, decorations });
  }

  commands({ schema, type }) {
    return () => toggleWrap(type, schema.nodes.paragraph);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  get markdownParserToken() {
    return {
      block: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(
      node,
      'spoiler',
      node.attrs.label ? `=${node.attrs.label}` : ''
    );
  }
}
