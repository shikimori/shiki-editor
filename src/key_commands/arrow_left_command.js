//  https://github.com/remirror/remirror/blob/270edd91ba6badf9468721e35fa0ddc6a21c6dd2/packages/remirror__core/src/builtins/keymap-extension.ts#L491
import { TextSelection } from 'prosemirror-state';

export default function exitMarkBackwards() {
  const backwardMarkExitTracker = new Map();

  return (state, dispatch) => {
    const { tr } = state;
    // const checker = startOfDoc ? isStartOfDoc : isStartOfTextBlock;
    const checker = isStartOfTextBlock;

    if (
      !checker(tr.selection) ||
        backwardMarkExitTracker.has(tr.selection.anchor)
    ) {
      // Clear the map to prevent it storing stale data.
      backwardMarkExitTracker.clear();
      return false;
    }

    // const isInsideExcludedNode = findParentNodeOfType({
    //   selection: tr.selection,
    //   types: excludedNodes,
    // });

    const isInsideExcludedNode = false;
    if (isInsideExcludedNode) { return false; }

    const marksToRemove = [
      ...(tr.storedMarks ?? []),
      ...tr.selection.$from.marks()
    ];
    // const marksToRemove = [...(tr.storedMarks ?? []), ...tr.selection.$from.marks()].filter(
    //   (mark) => !excludedMarks.includes(mark.type.name)
    // );

    if (!marksToRemove?.length) { return false; }
    if (!dispatch) { return true; }

    // Remove all the active marks at the current cursor.
    for (const mark of marksToRemove) {
      tr.removeStoredMark(mark);
    }

    backwardMarkExitTracker.set(tr.selection.anchor, true);

    dispatch(tr);

    return true;
  };
}

function isStartOfTextBlock(selection) {
  return !!(
    selection instanceof TextSelection &&
    selection.$cursor &&
    selection.$cursor.parentOffset <= 0
  );
}
