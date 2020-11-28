// based on https://github.com/ueberdosis/tiptap/blob/master/packages/tiptap-commands/src/commands/replaceText.js
export default function replaceText(range = null, type, attrs = {}) {
  return (state, dispatch) => {
    const { $from, $to } = state.selection;
    const index = $from.index();
    const from = range ? range.from : $from.pos;
    const to = range ? range.to : $to.pos;

    if (!$from.parent.canReplaceWith(index, index, type)) {
      return false;
    }

    if (dispatch) {
      dispatch(state.tr.replaceWith(from, to, type.create(attrs)));
    }

    return true;
  };
}
