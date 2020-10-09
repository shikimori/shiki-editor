import { insertPoint } from 'prosemirror-transform';

export default function insertNode(node) {
  return (state, dispatch) => {
    const from = state.selection.$from.pos;
    const point = insertPoint(node, from, node.type);

    dispatch(
      state.tr
        .insert(point ?? from, node)
        .scrollIntoView()
    );
  };
}
