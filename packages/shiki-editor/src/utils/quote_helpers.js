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

    if (attrs.user_id !== undefined) {
      attributes.push(attrs.user_id);
    }
    attributes.push(attrs.nickname);
  }

  const textAttrs = attributes.join(';');
  if (!textAttrs) { return ''; }

  return isAddEquals ? `=${textAttrs}` : textAttrs;
}
