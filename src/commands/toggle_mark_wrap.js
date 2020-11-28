/* eslint no-param-reassign:0  */
import { toggleMark } from 'prosemirror-commands';
import { getMarkRange, resolveWord } from '../utils';

export default function toggleMarkWrap(type, attrs) {
  return (state, dispatch) => {
    const { tr, selection } = state;
    const { $from, empty } = selection;

    const range = getMarkRange($from, type);

    // remove the whole mark at cursor position
    if (empty) {
      if (range) {
        return dispatch(tr.removeMark(range.from, range.to, type));
      } else {
        const $pos = state.tr.doc.resolve(selection.from);
        const wordRange = resolveWord($pos);

        if (wordRange) {
          return dispatch(
            tr.addMark(
              wordRange.from, wordRange.to, type.create(attrs))
          );
        }
      }
    }

    return toggleMark(type, attrs)(state, dispatch);
  };
}
