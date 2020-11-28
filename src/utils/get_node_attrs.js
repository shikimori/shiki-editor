// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-utils/src/utils/getNodeAttrs.js
export default function getNodeAttrs(type, state) {
  const { from, to } = state.selection;
  let nodes = [];

  state.doc.nodesBetween(from, to, node => {
    nodes = [...nodes, node];
  });

  const node = nodes
    .reverse()
    .find(nodeItem => nodeItem.type.name === type.name);

  if (node) {
    return node.attrs;
  }

  return {};
}
