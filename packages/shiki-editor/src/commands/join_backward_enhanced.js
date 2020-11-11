import { joinBackward } from 'prosemirror-commands';
import { Node } from 'prosemirror-model';

import toggleWrap from './toggle_wrap';
import toggleBlockType from './toggle_block_type';

export default function joinBackwardEnhanced(state, dispatch, view) {
  return unwrapEmptyBlockquoteLine(state, dispatch, view) ||
    unwrapEmptyCodeBlock(state, dispatch, view) ||
    joinBackward(state, dispatch, view);
}

function unwrapEmptyBlockquoteLine(state, dispatch, view) {
  if (state.selection.$cursor?.parentOffset !== 0) { return false; }

  const { blockquote, paragraph } = state.schema.nodes;

  const nodes = state.selection.$from.path.filter(v => v.constructor === Node);

  const lastNode = nodes[nodes.length - 1];
  const priorNode = nodes[nodes.length - 2];

  if (lastNode && priorNode &&
    lastNode.type === paragraph && !lastNode.textContent &&
    priorNode.type === blockquote
  ) {
    return toggleWrap(blockquote, paragraph)(state, dispatch, view);
  }

  return false;
}

function unwrapEmptyCodeBlock(state, dispatch, view) {
  if (state.selection.$cursor?.parentOffset !== 0) { return false; }

  const { code_block, paragraph } = state.schema.nodes;
  const parentNode = state.selection.$from.parent;

  if (parentNode.type === code_block && !parentNode.textContent) {
    return toggleBlockType(code_block, paragraph)(state, dispatch, view);
  }

  return false;
}

// 
// import { canJoin, liftTarget, ReplaceAroundStep } from 'prosemirror-transform';
// import { Slice, Fragment } from 'prosemirror-model';
// import { Selection, NodeSelection } from 'prosemirror-state';
// 
// export default function joinBackwardEnhanced(state, dispatch, view) {
//   let { $cursor } = state.selection;
//   if (!$cursor || (view ? !view.endOfTextblock('backward', state) :
//     $cursor.parentOffset > 0))
//     return false;
// 
//   let $cut = findCutBefore($cursor);
// 
//   // If there is no node before this, try to lift
//   if (!$cut) {
//     let range = $cursor.blockRange(), target = range && liftTarget(range);
//     if (target == null) return false;
//     if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView());
//     return true;
//   }
// 
//   let before = $cut.nodeBefore;
//   // Apply the joining algorithm
//   if (!before.type.spec.isolating && deleteBarrier(state, $cut, dispatch))
//     return true;
// 
//   // If the node below has no content and the node above is
//   // selectable, delete the node below and select the one above.
//   if ($cursor.parent.content.size == 0 &&
//       (textblockAt(before, 'end') || NodeSelection.isSelectable(before))) {
//     if (dispatch) {
//       let tr = state.tr.deleteRange($cursor.before(), $cursor.after());
//       tr.setSelection(textblockAt(before, 'end') ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1) :
//         NodeSelection.create(tr.doc, $cut.pos - before.nodeSize));
//       dispatch(tr.scrollIntoView());
//     }
//     return true;
//   }
// 
//   // If the node before is an atom, delete it
//   if (before.isAtom && $cut.depth == $cursor.depth - 1) {
//     if (dispatch) dispatch(state.tr.delete($cut.pos - before.nodeSize, $cut.pos).scrollIntoView());
//     return true;
//   }
// 
//   return false;
// 
// }
// 
// function findCutBefore($pos) {
//   if (!$pos.parent.type.spec.isolating) for (let i = $pos.depth - 1; i >= 0; i--) {
//     if ($pos.index(i) > 0) return $pos.doc.resolve($pos.before(i + 1));
//     if ($pos.node(i).type.spec.isolating) break;
//   }
//   return null;
// }
// 
// function deleteBarrier(state, $cut, dispatch) {
//   // debugger
//   let before = $cut.nodeBefore, after = $cut.nodeAfter, conn, match;
//   if (before.type.spec.isolating || after.type.spec.isolating) return false;
//   if (joinMaybeClear(state, $cut, dispatch)) return true;
// 
//   if ($cut.parent.canReplace($cut.index(), $cut.index() + 1) &&
//       (conn = (match = before.contentMatchAt(before.childCount)).findWrapping(after.type)) &&
//       match.matchType(conn[0] || after.type).validEnd) {
//     if (dispatch) {
//       let end = $cut.pos + after.nodeSize, wrap = Fragment.empty;
//       for (let i = conn.length - 1; i >= 0; i--)
//         wrap = Fragment.from(conn[i].create(null, wrap));
//       wrap = Fragment.from(before.copy(wrap));
//       let tr = state.tr.step(new ReplaceAroundStep($cut.pos - 1, end, $cut.pos, end, new Slice(wrap, 1, 0), conn.length, true));
//       let joinAt = end + 2 * conn.length;
//       if (canJoin(tr.doc, joinAt)) tr.join(joinAt);
//       dispatch(tr.scrollIntoView());
//     }
//     return true;
//   }
// 
//   let selAfter = Selection.findFrom($cut, 1);
//   let range = selAfter && selAfter.$from.blockRange(selAfter.$to), target = range && liftTarget(range);
//   if (target != null && target >= $cut.depth) {
//     if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView());
//     return true;
//   }
// 
//   return false;
// }
// 
// 
// function textblockAt(node, side) {
//   for (; node; node = (side == 'start' ? node.firstChild : node.lastChild))
//     if (node.isTextblock) return true;
//   return false;
// }
// 
// function joinMaybeClear(state, $pos, dispatch) {
//   // debugger
//   let before = $pos.nodeBefore, after = $pos.nodeAfter, index = $pos.index();
//   if (!before || !after || !before.type.compatibleContent(after.type)) return false;
//   if (!before.content.size && $pos.parent.canReplace(index - 1, index)) {
//     if (dispatch) dispatch(state.tr.delete($pos.pos - before.nodeSize, $pos.pos).scrollIntoView());
//     return true;
//   }
//   if (!$pos.parent.canReplace(index, index + 1) || !(after.isTextblock || canJoin(state.doc, $pos.pos)))
//     return false;
//   if (dispatch)
//     dispatch(state.tr
//       .clearIncompatible($pos.pos, before.type, before.contentMatchAt(before.childCount))
//       .join($pos.pos)
//       .scrollIntoView());
//   return true;
// }
