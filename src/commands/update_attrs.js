import { findParentSelectionNode } from '../utils';

export default function(type, attrs) {
  return (state, dispatch, view) => {
    const target = findParentSelectionNode(type, state.selection);

    if (!target) {
      return;
    }

    const transaction = state.tr.setNodeMarkup(
      target.pos,
      undefined,
      attrs
    );
    view.dispatch(transaction);
  };
}
