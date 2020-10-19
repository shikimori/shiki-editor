// import { insertPoint } from 'prosemirror-transform';

export default function insertNode(node, view) {
  return (state, dispatch) => {
    // const from = state.selection.$from.pos;
    // const point = insertPoint(node, from, node.type);

    // dispatch(
    //   state.tr
    //     .insert(point ?? from, node)
    //     .scrollIntoView()
    // );

    // logic taken from prosemirror paster from clipboard code
    dispatch(
      state.tr
        .replaceSelectionWith(node, view.shiftKey)
        .scrollIntoView()
        // .setMeta('paste', true)
        // .setMeta('uiEvent', 'paste')
    );

    // var singleNode = sliceSingleNode(slice);
    // var tr = singleNode ? view.state.tr.replaceSelectionWith(singleNode, view.shiftKey) : view.state.tr.replaceSelection(slice);
    // view.dispatch(tr.scrollIntoView().setMeta("paste", true).setMeta("uiEvent", "paste"));
  };
}
