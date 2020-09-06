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

export function addClass(cssClasses, cssClass) {
  return (
    (cssClasses || '')
      .split(' ')
      .filter(v => v !== cssClass)
      .join(' ') + ` ${cssClass}`
  ).trim();
}

export function removeClass(cssClasses, cssClass) {
  return (cssClasses || '')
    .split(' ')
    .filter(v => v !== cssClass)
    .join(' ');
}

export function hasClass(cssClasses, cssClass) {
  return !!(
    (cssClasses || '').split(' ').find(v => v === cssClass)
  );
}
