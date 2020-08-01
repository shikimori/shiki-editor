import { findParentNode, findSelectedNodeOfType } from 'prosemirror-utils';

export default function(type, selection) {
  const predicate = node => node.type === type;

  return findSelectedNodeOfType(type)(selection) ||
    findParentNode(predicate)(selection);
}

