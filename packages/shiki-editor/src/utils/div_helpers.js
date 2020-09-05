export function serializeClassAttr(node) {
  return node.attrs.class ? `=${node.attrs.class}` : '';
}

export function serializeDataAttr(node) {
  if (!node.attrs.data.length) { return ''; }

  const data = node.attrs.data
    .map(v => (v[1] ? `${v[0]}=${v[1]}` : v[0]))
    .join(' ');

  return ` ${data}`;
}

export function addClass(classes, add) {
  return classes
    .split(' ')
    .filter(v => v !== add)
    .join(' ') + ` ${add}`;
}

export function removeClass(classes, add) {
  return classes
    .split(' ')
    .filter(v => v !== add)
    .join(' ');
}
