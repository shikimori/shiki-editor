import { wrappingInputRule } from 'prosemirror-inputrules';
import { Plugin } from 'prosemirror-state';

import { Node } from '../base';
import { nodeIsActive } from '../checks';
import { toggleWrap } from '../commands';

import { serializeAttrs, toDOMInnerQuoteable } from '../utils/quote_helpers';
import { parseQuoteMeta } from '../markdown/tokenizer/bbcode_helpers';

export default class Blockquote extends Node {
  get name() {
    return 'blockquote';
  }

  get defaultOptions() {
    return { origin: null };
  }

  get schema() {
    return {
      content: 'block+',
      group: 'block',
      defining: true,
      draggable: false,
      attrs: {
        comment_id: { default: undefined },
        message_id: { default: undefined },
        topic_id: { default: undefined },
        userId: { default: undefined },
        nickname: { default: undefined }
      },
      parseDOM: [{
        tag: 'blockquote',
        getAttrs: node => parseQuoteMeta(node.getAttribute('data-attrs')),
        contentElement: 'div.quote-content'
      }],
      toDOM: node => {
        const innerQuoteable = toDOMInnerQuoteable(node.attrs, this);

        if (innerQuoteable) {
          return [
            'blockquote',
            {
              class: 'b-quote-v2',
              'data-attrs': serializeAttrs(node.attrs)
            },
            ['div', { class: 'quoteable' }, innerQuoteable],
            ['div', { class: 'quote-content' }, 0]
          ];
        }
        return [
          'blockquote',
          {
            class: 'b-quote-v2',
            'data-attrs': serializeAttrs(node.attrs)
          },
          ['div', { class: 'quote-content' }, 0]
        ];
      }
    };
  }

  commands({ type }) {
    return () => toggleWrap(type);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  keys({ type }) {
    return {
      'Ctrl->': toggleWrap(type)
    };
  }

  inputRules({ type }) {
    return [
      wrappingInputRule(/^\s*>\s$/, type)
    ];
  }

  // hack to prevent getting extra new line before tag
  get plugins() {
    return [
      new Plugin({
        props: {
          transformPastedHTML(html) {
            if (html.includes('data-pm-slice')) { return html; }

            return html.replace(
              /<br[^>]*><blockquote/g,
              '<blockquote'
            );
          }
        }
      })
    ];
  }

  markdownSerialize(state, node) {
    const textAttrs = serializeAttrs(node.attrs);

    if (textAttrs) {
      state.wrapBlock('>?', null, node, () => state.write(textAttrs));
    }
    state.wrapBlock('> ', null, node, () => state.renderContent(node));
  }
}
