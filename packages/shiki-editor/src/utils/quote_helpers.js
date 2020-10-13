export function serializeAttrs(attrs, isAddEquals = false) {
  const attributes = [];

  if (attrs.nickname !== undefined) {
    if (attrs.comment_id !== undefined) {
      attributes.push(`c${attrs.comment_id}`);
    } else if (attrs.message_id !== undefined) {
      attributes.push(`m${attrs.message_id}`);
    } else if (attrs.topic_id !== undefined) {
      attributes.push(`t${attrs.topic_id}`);
    }

    if (attrs.userId !== undefined) {
      attributes.push(attrs.userId);
    }
    attributes.push(attrs.nickname);
  }

  const textAttrs = attributes.join(';');
  if (!textAttrs) { return ''; }

  return isAddEquals ? `=${textAttrs}` : textAttrs;
}

export function toDOMInnerQuoteable(attrs, schemaNode) {
  if (!attrs.nickname) { return; }

  if (attrs.comment_id || attrs.message_id || attrs.topic_id) {
    let href;

    if (attrs.comment_id) {
      href = `/comments/${attrs.comment_id}`;
    } else if (attrs.message_id) {
      href = `/messages/${attrs.message_id}`;
    } else {
      href = `/topics/${attrs.topic_id}`;
    }

    return [
      'a',
      {
        class: 'b-link b-user16',
        href: schemaNode.prependBaseUrl(href),
        target: '_blank'
      },
      [
        'img',
        {
          src: schemaNode.prependBaseUrl(
            `/system/users/x16/${attrs.userId}.png`
          ),
          srcset: schemaNode.prependBaseUrl(
            `/system/users/x32/${attrs.userId}.png 2x`
          )
        }
      ],
      [
        'span',
        attrs.nickname
      ]
    ];
  } else {
    return attrs.nickname;
  }
}
