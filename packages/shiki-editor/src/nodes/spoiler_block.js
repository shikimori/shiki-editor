import { bind } from 'shiki-decorators';

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
      content: 'block*',
      group: 'block',
      defining: true,
      draggable: false,
      attrs: {
        label: { default: this.defaultLabel },
        isOpened: { default: true },
        isFullwidth: { default: false },
        isCentered: { default: false },
        nFormat: {
          default: {
            nBeforeOpen: true,
            nAfterOpen: true,
            nBeforeClose: true
          }
        }
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
            class: 'b-spoiler_block' + (
              node.attrs.isOpened ? ' is-opened' : ''
            )
          },
          ['span', node.attrs.label],
          ['div', 0]
        ];
      }
    };
  }

  get defaultLabel() {
    return window.I18n.t('frontend.shiki_editor.spoiler');
  }

  view(options) {
    return new SpoilerBlockView(options);
  }

  commands({ schema, type }) {
    return () => toggleWrap(type, schema.nodes.paragraph);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  @bind
  markdownSerialize(state, node) {
    let meta = node.attrs.label && node.attrs.label !== this.defaultLabel ?
      `=${node.attrs.label}` :
      '';
    if (node.attrs.isFullwidth) {
      meta += ' is-fullwidth';
    }
    if (node.attrs.isCentered) {
      meta += ' is-centered';
    }

    state.renderBlock(
      node,
      'spoiler_block',
      meta,
      node.attrs.nFormat
    );
  }
}
