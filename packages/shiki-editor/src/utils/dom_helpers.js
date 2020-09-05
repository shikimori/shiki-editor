export function findParent(node, predicate) {
  if (predicate(node)) {
    return node;
  }

  if (node.parentNode && node.parentNode !== document) {
    return findParent(node.parentNode, predicate);
  }

  return null;
}

export function findNode(node, predicate) {
  for (let i = 0; i <= node.childNodes.length; i += 1) {
    if (predicate(node.childNodes[i])) {
      return node.childNodes[i];
    }
  }

  return null;
}

export function findIndex(node) {
  let index;

  for (let i = 0; i <= node.parentNode.childNodes.length; i += 1) {
    if (node.parentNode.childNodes[i] === node) {
      index = i;
      break;
    }
  }

  return index;
}
