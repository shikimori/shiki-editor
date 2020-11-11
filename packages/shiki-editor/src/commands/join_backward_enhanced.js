import { joinBackward } from 'prosemirror-commands';
import { Node } from 'prosemirror-model';
import { Selection, NodeSelection } from 'prosemirror-state';

import toggleWrap from './toggle_wrap';
import toggleBlockType from './toggle_block_type';

export default function joinBackwardEnhanced(state, dispatch, view) {
  let { $cursor } = state.selection;
  if (!$cursor ||
    (view ? !view.endOfTextblock('backward', state) : $cursor.parentOffset > 0)
  ) { return false; }

  return unwrapEmptyBlockquoteLine(state, dispatch, view) ||
    removeEmptyBlockquoteRelatedLine(state, dispatch, view) ||
    unwrapEmptyCodeBlock(state, dispatch, view) ||
    joinBackward(state, dispatch, view);
}

function unwrapEmptyBlockquoteLine(state, dispatch, view) {
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

function removeEmptyBlockquoteRelatedLine(state, dispatch, _view) {
  const { $cursor } = state.selection;
  const { blockquote, paragraph } = state.schema.nodes;

  const $cut = findCutBefore($cursor);

  if (!$cut) { return false; }
  const before = $cut.nodeBefore;
  const after = $cut.nodeAfter;

  if (before.type !== blockquote || after.type !== paragraph) { return false; }

  return removePriorEmptyBlockquoteLine($cut, state, dispatch) ||
    removeCurrentEmptyLineBeforeBlockquote($cut, state, dispatch);
}

function removePriorEmptyBlockquoteLine($cut, state, dispatch) {
  const before = $cut.nodeBefore;
  const beforeNodes = before.content.content;
  const { paragraph } = state.schema.nodes;

  const lastNode = beforeNodes[beforeNodes.length - 1];

  // check last paragraph is empty
  if (lastNode.type === paragraph && !lastNode.textContent) {
    if (beforeNodes.length === 1) { // the only paragraph in the blockquote
    } else { // multiple paragraphs in the blockquote
      debugger
      // let tr = state.tr.deleteRange($cut.before(), $cut.after());
      // dispatch(tr.scrollIntoView());
      return true;
    }
  }
  // debugger
  // if (before.content.size === 2 && textblockAt(before, 'end') && 
  //   !before.textContent
  // ) {
  //   debugger
  // }
  return false;
}

function removeCurrentEmptyLineBeforeBlockquote($cut, state, dispatch) {
  const { $cursor } = state.selection;
  const before = $cut.nodeBefore;

  // If the node below has no content and the node above is
  // selectable, delete the node below and select the one above.
  if ($cursor.parent.content.size === 0 &&
    (textblockAt(before, 'end') || NodeSelection.isSelectable(before))
  ) {
    let tr = state.tr.deleteRange($cursor.before(), $cursor.after());

    tr.setSelection(
      textblockAt(before, 'end') ?
        Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1) :
        NodeSelection.create(tr.doc, $cut.pos - before.nodeSize)
    );

    dispatch(tr.scrollIntoView());
    return true;
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

function findCutBefore($pos) {
  if (!$pos.parent.type.spec.isolating) {
    for (let i = $pos.depth - 1; i >= 0; i--) {
      if ($pos.index(i) > 0) { return $pos.doc.resolve($pos.before(i + 1)); }
      if ($pos.node(i).type.spec.isolating) { break; }
    }
  }
  return null;
}

function textblockAt(node, side) {
  for (; node; node = (side == 'start' ? node.firstChild : node.lastChild)) { // eslint-disable-line no-param-reassign
    if (node.isTextblock) { return true; }
  }
  return false;
}
