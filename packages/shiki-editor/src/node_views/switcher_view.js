import DOMView from './dom_view';

import {
  serializeClassAttr,
  serializeDataAttr
} from '../utils/div_helpers';

export default class SwitcherView extends DOMView {
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
  }
}
