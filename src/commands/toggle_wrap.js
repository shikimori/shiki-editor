// https://github.com/scrumpy/tiptap/blob/v1/packages/tiptap-commands/src/commands/toggleWrap.js
import { wrapIn } from 'prosemirror-commands';
import { nodeIsActive } from '../checks';
import { liftTarget } from 'prosemirror-transform';

export default function(type) {
  return (state, dispatch, view) => {
    const isActive = nodeIsActive(type, state);

    if (isActive) {
      const predicate = node => node.type === type;
      // logic here is the same as in `lift` command, but `range` is found
      // with `predicate` argument which matches desired node type
      const { $from, $to } = state.selection;
      const range = $from.blockRange($to, predicate);
      const target = range && liftTarget(range);
      if (target == null) { return false; }

      if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView());
      return true;
    }

    return wrapIn(type)(state, dispatch, view);
  };
}
