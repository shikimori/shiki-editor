import { Mark } from 'prosemirror-model';
import { bind } from 'shiki-decorators';

import { NodeView } from '../node_view';
import { findChildren } from 'prosemirror-utils/src/node';
import { getMarkRange } from '../utils';

import {
  hasClass,
  serializeClassAttr,
  serializeDataAttr
} from '../utils/div_helpers';
import { attrsAddClass, attrsRemoveClass } from '../utils/node_helpers';
import { removeAllAttributes } from '../utils/dom_helpers';

export default class SwitcherView extends NodeView {
  mount() {
    this.dom = document.createElement(this.elementType);
    this.contentDOM = this.dom;

    this.syncState();

    this.dom.addEventListener('click', this.click);
  }

  get elementType() {
    return this.isInline ? 'span' : 'div';
  }

  get isInline() {
    return this.node.constructor === Mark;
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

      const otherMarkNodes = findChildren(this.view.state.doc, node => (
        node.marks.some(isSwitcherIdMatched(switcherId))
      ));

      otherNodes.forEach(({ node, pos }) => {
        transaction = toggleNode(node, false, pos, transaction);
      });
      otherMarkNodes.forEach(({ node, pos }) => {
        transaction = toggleMarkNode(
          node,
          node.marks.find(isSwitcherIdMatched(switcherId)),
          false,
          pos,
          transaction
        );
      });
    }

    if (this.isInline) {
      const range = getMarkPos(this.node, this.view, this.dom);

      transaction = toggleMarkNode(
        {
          nodeSize: range.to - range.from
        },
        this.node,
        !isActive,
        range.from,
        transaction
      );
    } else {
      transaction =
        toggleNode(this.node, !isActive, this.getPos(), transaction);
    }
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
      `data-${this.elementType}`,
      `[${this.elementType}` +
        `${serializeClassAttr(this.node)}${serializeDataAttr(this.node)}]`
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

function toggleMarkNode(node, mark, isActive, pos, transaction) {
  const markType = mark.type;

  return transaction
    .removeMark(
      pos,
      pos + node.nodeSize,
      markType
    )
    .addMark(
      pos,
      pos + node.nodeSize,
      markType.create(
        isActive ?
          attrsAddClass(mark, 'active') :
          attrsRemoveClass(mark, 'active')
      )
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

function getMarkPos(mark, view, dom) {
  const pos = view.posAtDOM(dom);
  const resolvedPos = view.state.doc.resolve(pos);

  return getMarkRange(resolvedPos, mark.type);
}
