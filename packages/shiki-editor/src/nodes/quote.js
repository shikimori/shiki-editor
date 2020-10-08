import { Node } from '../base';
import { serializeAttrs } from '../utils/quote_helpers';
import { parseQuoteMeta } from '../markdown/tokenizer/bbcode_helpers';

export default class Quote extends Node {
  get name() {
    return 'quote';
  }

  get defaultOptions() {
    return { origin: null };
  }

  get schema() {
    return {
      content: 'block*',
      group: 'block',
      defining: true,
      draggable: false,
      attrs: {
        comment_id: { default: undefined },
        message_id: { default: undefined },
        topic_id: { default: undefined },
        user_id: { default: undefined },
        nickname: { default: undefined },
        nFormat: {
          default: {
            nBeforeOpen: true,
            nAfterOpen: true,
            nBeforeClose: true
          }
        }
      },
      parseDOM: [{
        tag: 'div.b-quote',
        getAttrs: node => parseQuoteMeta(node.getAttribute('data-attrs')),
        contentElement: 'div.quote-content'
      }],
      toDOM: node => {
        if (node.attrs.nickname) {
          let innerQuoteable;

          if (node.attrs.comment_id || node.attrs.message_id ||
            node.attrs.topic_id
          ) {
            let href;

            if (node.attrs.comment_id) {
              href = `/comments/${node.attrs.comment_id}`;
            } else if (node.attrs.message_id) {
              href = `/messages/${node.attrs.message_id}`;
            } else {
              href = `/topics/${node.attrs.topic_id}`;
            }

            innerQuoteable = [
              'a',
              {
                class: 'b-link b-user16',
                href: this.prependBaseUrl(href),
                target: '_blank'
              },
              [
                'img',
                {
                  src: this.prependBaseUrl(
                    `/system/users/x16/${node.attrs.user_id}.png`
                  ),
                  srcset: this.prependBaseUrl(
                    `/system/users/x32/${node.attrs.user_id}.png 2x`
                  )
                }
              ],
              [
                'span',
                node.attrs.nickname
              ]
            ];
          } else {
            innerQuoteable = node.attrs.nickname;
          }

          return [
            'div',
            {
              class: 'b-quote',
              'data-attrs': serializeAttrs(node.attrs)
            },
            ['div', { class: 'quoteable' }, innerQuoteable],
            ['div', { class: 'quote-content' }, 0]
          ];
        }
        return [
          'div',
          {
            class: 'b-quote',
            'data-attrs': serializeAttrs(node.attrs)
          },
          ['div', { class: 'quote-content' }, 0]
        ];
      }
    };
  }

  markdownSerialize(state, node) {
    state.renderBlock(
      node,
      'quote',
      serializeAttrs(node.attrs, true),
      node.attrs.nFormat
    );
  }
}
