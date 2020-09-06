import { bind } from 'shiki-decorators';
import DOMView from './dom_view';
import { findChildren } from 'prosemirror-utils';

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
    const switcherId = this.node.attrs.data
      .find(([name, _]) => name === 'data-switcher')
      ?.[1];

    let transaction = this.tr.setMeta('addToHistory', false);

    if (switcherId && !isActive) {
      const otherNodes =
        findChildren(this.view.state.doc, isSwitcherIdMatched(switcherId));

      otherNodes.forEach(({ node, pos }) => {
        transaction = toggleNode(node, false, pos, transaction);
      });
    }

    transaction = toggleNode(this.node, !isActive, this.getPos(), transaction);
    this.dispatch(transaction);
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

function toggleNode(node, isActive, pos, transaction) {
  return transaction.setNodeMarkup(
    pos,
    null,
    isActive ?
      attrsAddClass(node, 'active') :
      attrsRemoveClass(node, 'active')
  );
}

function isSwitcherIdMatched(switcherId) {
  return node => (
    node.attrs.data?.some(([name, value]) => (
      name === 'data-dynamic' && value === 'switcher'
    )) && node.attrs.data?.some(([name, value]) => (
      name === 'data-switcher' && value === switcherId
    ))
  );
}
