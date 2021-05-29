import { TextSelection } from 'prosemirror-state';

// https://github.com/remirror/remirror/blob/270edd91ba6badf9468721e35fa0ddc6a21c6dd2/packages/remirror__core/src/builtins/keymap-extension.ts#L277
export default function(state, dispatch) {
  return exitMarkForwards(state, dispatch);
}

function exitMarkForwards(state, dispatch) {
  // const excludedMarks = [];
  // const excludedNodes = [];

  const { tr } = state;

  if (!isEndOfTextBlock(tr.selection)) { return false; }

  // const isInsideExcludedNode = findParentNodeOfType({
  //   selection: tr.selection,
  //   types: excludedNodes
  // });

  const isInsideExcludedNode = false;
  if (isInsideExcludedNode) { return false; }

  const $pos = tr.selection.$from;
  const marksToRemove = $pos.marks();
  // const marksToRemove = $pos.marks().filter((mark) => (
  //   !excludedMarks.includes(mark.type.name)
  // ));

  if (!marksToRemove?.length) { return false; }
  if (!dispatch) { return true; }

  for (const mark of marksToRemove) {
    tr.removeStoredMark(mark);
  }

  dispatch(tr.insertText(' ', tr.selection.from));

  return true;
}

function isEndOfTextBlock(selection) {
  return !!(
    selection instanceof TextSelection &&
      selection.$cursor &&
      selection.$cursor.parentOffset >= selection.$cursor.parent.content.size
  );
}
