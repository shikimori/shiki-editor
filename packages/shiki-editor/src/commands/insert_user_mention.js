import { addToCache } from '../extensions';

export default function insertUserMention({ range, attrs, schema }) {
  return (state, dispatch, _view) => {
    const replacement = schema.text(
      attrs.text,
      [
        markLinkInline(schema, attrs)
      ]
    );

    dispatch(state.tr.replaceWith(range.from, range.to, replacement));
    addToCache('user', attrs.id, attrs);
  };
}

function markLinkInline(schema, attrs) {
  return schema.marks.link_inline.create({
    ...attrs,
    type: 'user',
    meta: { isMention: true }
  }, null, []);
}
