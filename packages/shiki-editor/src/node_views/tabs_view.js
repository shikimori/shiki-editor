import { bind } from 'shiki-decorators';
import DOMView from './dom_view';

import { serializeClassAttr, serializeDataAttr } from '../utils/div_helpers';

export default class TabsView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('div');
    this.contentDOM = this.dom;

    if (this.node.attrs.class) {
      this.dom.setAttribute('class', this.node.attrs.class);
    }
    this.node.attrs.data?.forEach(([name, value]) => (
      this.dom.setAttribute(name, value)
    ));

    this.dom.setAttribute(
      'data-div',
      `[div${serializeClassAttr(this.node)}${serializeDataAttr(this.node)}]`
    );

    this.dom.addEventListener('click', this.click, true);
  }

  @bind
  click(e) {
    const tabNode = findParent(
      e.target,
      node => node.getAttribute('data-tab-switch') != null
    );

    if (tabNode) {
      e.stopImmediatePropagation();
      console.log(
        this.node.content
      )
    }
  }
}

function findParent(node, predicate) {
  if (predicate(node)) {
    return node;
  }

  if (node.parentNode && node.parentNode !== document) {
    return findParent(node.parentNode, predicate);
  }

  return null;
}
