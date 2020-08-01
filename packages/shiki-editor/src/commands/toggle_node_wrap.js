import { wrapIn } from 'prosemirror-commands';
import { nodeIsActive } from '../checks';
import { liftTarget } from 'prosemirror-transform';
import { NodeRange } from 'prosemirror-model';

import { findParentSelectionNode } from '../utils';

export default function(type) {
  return (state, dispatch, view) => {
    const isActive = nodeIsActive(type, state);

    if (isActive) {
      let range;

      // when nothing is selected unwrap the whole node
      if (state.selection.empty && dispatch) {
        const { node, start, depth } =
          findParentSelectionNode(type, state.selection);

        const $from = state.tr.doc.resolve(start + 1);
        const $to = state.tr.doc.resolve(
          start + 1 + node.nodeSize - node.lastChild.nodeSize
        );
        range = new NodeRange($from, $to, depth);
      } else {
        const predicate = node => node.type === type;
        // logic here is the same as in `lift` command, but `range` is found
        // with `predicate` argument which matches desired node type
        const { $from, $to } = state.selection;
        range = $from.blockRange($to, predicate);
      }

      const target = range && liftTarget(range);
      if (target == null) { return false; }
      if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView());
      return true;
    }

    return wrapIn(type)(state, dispatch, view);
  };
}
