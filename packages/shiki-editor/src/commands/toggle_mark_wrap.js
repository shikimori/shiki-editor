import { toggleMark } from 'prosemirror-commands';
import { getMarkRange } from '../utils';

export default function toggleMarkWrap(type, attrs) {
  return (state, dispatch) => {
    const { tr, selection } = state;
    const { $from, empty } = selection;

    const range = getMarkRange($from, type);

    // remove the whole mark at cursor position
    if (empty && range) {
      tr.removeMark(range.from, range.to, type);
      return dispatch(tr);
    }

    return toggleMark(type, attrs)(state, dispatch);
  };
}
