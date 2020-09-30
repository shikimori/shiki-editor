export default function insertReply({ id, type, text, url }) {
  return (state, dispatch) => {
    const { $from, $to } = state.selection;
    const from = $from.pos;
    const to = $to.pos;

    const linkInlineMark = state.schema.marks.link_inline.create({
      id,
      type,
      text,
      url,
      meta: { isMention: true }
    }, null, []);
    const textFragment = state.schema.text(text, linkInlineMark);

    dispatch(
      state.tr
        .replaceWith(from, to, textFragment)
        .replaceWith(
          to + textFragment.nodeSize,
          to + textFragment.nodeSize,
          state.schema.text(', ')
        )
    );
  };
}
