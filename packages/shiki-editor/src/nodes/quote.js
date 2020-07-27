import { Node } from '../base';

export default class Quote extends Node {
  get name() {
    return 'quote';
  }

  get defaultOptions() {
    return { baseUrl: null };
  }

  get schema() {
    return {
      content: 'block*',
      group: 'block',
      defining: true,
      draggable: false,
      attrs: {
        comment_id: { default: null },
        message_id: { default: null },
        topic_id: { default: null },
        user_id: { default: null },
        nickname: { default: null },
        nBeforeOpen: {},
        nAfterOpen: {},
        nBeforeClose: {}
      },
      parseDOM: [{
        tag: 'div.b-quote',
        getAttrs: node => ({
          comment_id: node.getAttribute('data-comment_id'),
          message_id: node.getAttribute('data-message_id'),
          topic_id: node.getAttribute('data-topic_id'),
          user_id: node.getAttribute('data-user_id'),
          nickname: node.getAttribute('data-nickname')
        }),
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
              'data-comment_id': node.attrs.comment_id,
              'data-message_id': node.attrs.message_id,
              'data-topic_id': node.attrs.topic_id,
              'data-user_id': node.attrs.user_id,
              'data-nickname': node.attrs.nickname
            },
            ['div', { class: 'quoteable' }, innerQuoteable],
            ['div', { class: 'quote-content' }, 0]
          ];
        }
        return [
          'div',
          { class: 'b-quote' },
          ['div', { class: 'quote-content' }, 0]
        ];
      }
    };
  }

  markdownSerialize(state, node) {
    const attributes = [];

    if (node.attrs.nickname) {
      if (node.attrs.comment_id) {
        attributes.push(`c${node.attrs.comment_id}`);
      } else if (node.attrs.message_id) {
        attributes.push(`m${node.attrs.message_id}`);
      } else if (node.attrs.topic_id) {
        attributes.push(`t${node.attrs.topic_id}`);
      }

      if (node.attrs.user_id) {
        attributes.push(node.attrs.user_id);
      }
      attributes.push(node.attrs.nickname);
    }

    state.renderBlock(
      node,
      'quote',
      attributes.length ? attributes.join(';') : '',
      node.attrs
    );
  }
}
