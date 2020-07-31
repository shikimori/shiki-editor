export default function ensureOnlyStyle(node, styleName) {
  const attributes = node
    .getAttribute('style')
    .split(';')
    .filter(v => v);

  return attributes.length === 1 &&
    attributes[0].split(':')[0] === styleName;
}
