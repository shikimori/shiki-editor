import { bind } from 'shiki-decorators';
import DOMView from './dom_view';

import {
  hasClass,
  serializeClassAttr,
  serializeDataAttr
} from '../utils/div_helpers';
import { attrsAddClass, attrsRemoveClass } from '../utils/node_helpers';
import { removeAllAttributes } from '../utils/dom_helpers';

export default class SwitcherView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('div');
    this.contentDOM = this.dom;

    this.syncState();

    this.dom.addEventListener('click', this.click);
  }

  @bind
  click() {
    const isActive = hasClass(this.node.attrs.class, 'active');

    console.log(
      isActive ?
        attrsRemoveClass(this.node, 'active') :
        attrsAddClass(this.node, 'active')
    );

    this.dispatch(
      this.tr.setNodeMarkup(
        this.getPos(),
        null,
        isActive ?
          attrsRemoveClass(this.node, 'active') :
          attrsAddClass(this.node, 'active')
      )
    );
  }

  syncState() {
    removeAllAttributes(this.dom);

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
