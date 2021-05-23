import { bind } from 'shiki-decorators';
import { Plugin, PluginKey } from 'prosemirror-state';

import { Node } from '../base';
import { nodeIsActive } from '../checks';
import { toggleWrap } from '../commands';
import { SpoilerBlockView } from '../node_views';
import { nodeViewRenderer } from '../node_view';

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
          isOpened: node.classList.contains('is-opened'),
          isFullwidth: node.classList.contains('is-fullwidth'),
          isCentered: node.classList.contains('is-centered')
        }),
        contentElement: node => node.children[1]
      }],
      toDOM(node) {
        return [
          'div',
          {
            class: 'b-spoiler_block' + (
              node.attrs.isOpened ? ' is-opened' : ''
            ) + (
              node.attrs.isFullwidth ? ' is-fullwidth' : ''
            ) + (
              node.attrs.isCentered ? ' is-centered' : ''
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

  get view() {
    return nodeViewRenderer(SpoilerBlockView);
  }

  commands({ schema, type }) {
    return () => toggleWrap(type, schema.nodes.paragraph);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  // hack to prevent getting extra new line before tag
  get plugins() {
    return [
      new Plugin({
        key: new PluginKey('node_spoiler_block'),
        props: {
          transformPastedHTML(html) {
            if (html.includes('data-pm-slice')) { return html; }

            return html.replace(
              /<br[^>]*><div class=(['"])b-spoiler_block/g,
              '<div class=$1b-spoiler_block'
            );
          }
        }
      })
    ];
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
