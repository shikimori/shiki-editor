export default function insertLink(type, attrs) {
  return (state, dispatch) => {
    const { from, to } = state.selection;

    const linkInlineMark = state.schema.marks.link_inline.create(attrs);
    const textFragment = state.schema.text(
      attrs.text || attrs.url,
      [linkInlineMark]
    );

    dispatch(
      state.tr
        .replaceWith(from, to, textFragment)
        .scrollIntoView()
    );
  };
}
