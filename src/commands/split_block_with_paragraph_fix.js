import { canSplit } from 'prosemirror-transform';
import { Fragment } from 'prosemirror-model';
import { TextSelection, NodeSelection, AllSelection } from 'prosemirror-state';

// splitBlock from prosemirror-transform, but instead of original
// splitBlock this command removes `isHardBreak` attribute from original `paragraph` node
export default function splitBlockWithParagraphFix(state, dispatch) {
  let { $from, $to } = state.selection;

  if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
    if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) return false;
    if (dispatch) dispatch(state.tr.split($from.pos).scrollIntoView());
    return true;
  }

  if (!$from.parent.isBlock) return false;

  if (dispatch) {
    const atEnd = $to.parentOffset == $to.parent.content.size;
    const tr = state.tr;
    if (state.selection instanceof TextSelection ||
      state.selection instanceof AllSelection
    ) {
      tr.deleteSelection();
    }
    const deflt = $from.depth == 0 ?
      null :
      defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));

    let types = atEnd && deflt ?
      [{ type: deflt }] :
      null;
    let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);

    if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt && [{ type: deflt }])) {
      types = [{ type: deflt }];
      can = true;
    }

    if (can) {
      tr.split(tr.mapping.map($from.pos), 1, types);

      // remove `isHardBreak` from previous paragraph
      if (deflt.name === 'paragraph' &&
          $from.parent.type.name === 'paragraph' &&
          $from.parent.attrs.isHardBreak) {
        tr.setNodeMarkup($from.before(), null, { isHardBreak: false });
      }

      if (!atEnd && !$from.parentOffset && $from.parent.type != deflt &&
          $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), Fragment.from([deflt.create(), $from.parent])))
        tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
    }
    dispatch(tr.scrollIntoView());
  }
  return true;
}

function defaultBlockAt(match) {
  for (let i = 0; i < match.edgeCount; i++) {
    let { type } = match.edge(i);
    if (type.isTextblock && !type.hasRequiredAttrs()) return type;
  }
  return null;
}
