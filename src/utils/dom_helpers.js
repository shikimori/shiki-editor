export function findParent(node, predicate) {
  if (predicate(node)) {
    return node;
  }

  if (node.parentNode && node.parentNode !== document) {
    return findParent(node.parentNode, predicate);
  }

  return null;
}

// export function findChildNode(node, predicate) {
//   for (let i = 0; i <= node.childNodes.length; i += 1) {
//     if (predicate(node.childNodes[i])) {
//       return node.childNodes[i];
//     }
//   }
//
//   return null;
// }

export function findIndex(nodes, predicate) {
  for (let i = 0; i < nodes.length; i += 1) {
    if (predicate(nodes[i])) {
      return i;
    }
  }

  return null;
}

export function removeAllAttributes(node) {
  for (var i = node.attributes.length - 1; i >= 0; i -= 1){
    node.removeAttribute(node.attributes[i].name);
  }
}
