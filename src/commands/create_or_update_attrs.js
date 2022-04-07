import { getMarkRange, resolveWord } from '../utils';
import { toggleMark } from 'prosemirror-commands';

export default function createOrUpdateAttrs(type, attrs) {
  return (state, dispatch) => {
    const { tr, selection } = state;
    const { $from, empty } = selection;

    const range = getMarkRange($from, type);

    if (empty) {
      if (range) {
        return dispatch(tr.addMark(range.from, range.to, type.create(attrs)));
      } else {
        const $pos = state.tr.doc.resolve(selection.from);
        const wordRange = resolveWord($pos);

        if (wordRange) {
          return dispatch(tr.addMark(wordRange.from, wordRange.to, type.create(attrs)));
        }
      }
    } else if (range) {
      return dispatch(tr.addMark(range.from, range.to, type.create(attrs)));
    }

    return toggleMark(type, attrs)(state, dispatch);
  };
}
