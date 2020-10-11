import { getShikiLoader } from '../utils';

export default function insertReply({ id, type, user_id, text, url }, editor) {
  return (state, dispatch) => {
    if (editor) {
      const loader = getShikiLoader(editor);
      loader.addToCache(type, id, { id, text, user_id, url }, true);
    }

    const { $from, $to } = state.selection;
    const from = $from.pos;
    const to = $to.pos;

    const linkInlineMark = state.schema.marks.link_inline.create({
      id,
      type,
      user_id,
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
        .scrollIntoView()
    );
  };
}
