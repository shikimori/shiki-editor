export default function isContainsCodeMark(node) {
  if (!node) { return false; }

  return node.isText && node.marks.some(mark => mark.type.spec.code);
}
