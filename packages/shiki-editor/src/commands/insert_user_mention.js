export default function insertUserMention({ range, attrs, schema }) {
  return (state, dispatch, _view) => {
    console.log(range, attrs, schema);
    const replacement = schema.text(
      attrs.nickname,
      [
        markLinkInline(schema, attrs)
      ]
    );

    dispatch(
      state.tr
        .replaceWith(range.from, range.to, replacement)
    );
  };
}

function markLinkInline(schema, attrs) {
  return schema.marks.link_inline.create({
    url: attrs.url,
    id: attrs.id,
    type: 'user',
    meta: { isMention: true }
  }, null, []);
}
