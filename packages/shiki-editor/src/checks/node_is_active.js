// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-utils/src/utils/nodeIsActive.js
import { findParentSelectionNode } from '../utils';

export default function(type, state, attrs = {}) {
  const result = findParentSelectionNode(type, state.selection);

  if (!Object.keys(attrs).length || !result) {
    return !!result;
  }

  return result.node.hasMarkup(type, { ...result.node.attrs, ...attrs });
}
