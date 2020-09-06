import { addClass, removeClass } from '../utils/div_helpers';

export function attrsAddClass(node, cssClass) {
  // const newAttrs = clone(node.attrs);
  // newAttrs.class = addClass(newAttrs.class, cssClass);
  //
  // return newAttrs;

  return {
    ...node.attrs,
    class: addClass(node.attrs.class, cssClass)
  };
}

export function attrsRemoveClass(node, cssClass) {
  // const newAttrs = clone(node.attrs);
  // newAttrs.class = removeClass(newAttrs.class, cssClass);
  //
  // return newAttrs;

  return {
    ...node.attrs,
    class: removeClass(node.attrs.class, cssClass)
  };
}

