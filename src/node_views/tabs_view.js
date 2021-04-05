import { bind } from 'shiki-decorators';
import { findChildren } from 'prosemirror-utils/src/node';

import DOMView from './dom_view';

import { serializeClassAttr, serializeDataAttr } from '../utils/div_helpers';
import { attrsAddClass, attrsRemoveClass } from '../utils/node_helpers';
import { findParent, findIndex } from '../utils/dom_helpers';

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

    this.dom.addEventListener('click', this.click);
  }

  @bind
  click(e) {
    const tabNode = findParent(
      e.target,
      node => node.getAttribute('data-tab-switch') != null
    );
    const tabNodes = this.dom.querySelectorAll('[data-tab-switch]');

    if (tabNode) {
      e.stopImmediatePropagation();

      const currentIndex = findIndex(
        tabNodes,
        node => node.classList.contains('active')
      ) || 0;
      const newIndex = findIndex(tabNodes, node => node === tabNode);

      if (newIndex !== currentIndex) {
        this.switchTab(newIndex, currentIndex);
      }
    }
  }

  switchTab(newIndex, currentIndex) {
    let switchNodes = findChildren(this.node, isDivTabSwitch);
    let switchMarkNodes;

    if (!switchNodes.length) {
      switchMarkNodes = findChildren(this.node, node => (
        node.isText && node.marks.some(isMarkTabSwitch)
      ));
    }

    const tabNodes = findChildren(this.node, node => (
      node.type.name === 'div' &&
        node.attrs?.data?.some(([name, _]) => name === 'data-tab')
    ));

    const newSwitchNode = switchNodes[newIndex] ||
      switchMarkNodes[newIndex];
    const currentSwitchNode = switchNodes[currentIndex] ||
      switchMarkNodes[currentIndex];

    const newTabNode = tabNodes[newIndex];
    const currentTabNode = tabNodes[currentIndex];

    let transaction = this.tr.setMeta('addToHistory', false);

    if (newSwitchNode.node.isText) {
      const newSwitchMark = newSwitchNode.node.marks.find(isMarkTabSwitch);
      const currentSwitchMark = currentSwitchNode.node.marks.find(isMarkTabSwitch);
      const markType = newSwitchMark.type;

      transaction = transaction
        .removeMark(
          this.getPos() + currentSwitchNode.pos + 1,
          this.getPos() + currentSwitchNode.pos + 1 + currentSwitchNode.node.nodeSize,
          markType
        )
        .addMark(
          this.getPos() + currentSwitchNode.pos + 1,
          this.getPos() + currentSwitchNode.pos + 1 + currentSwitchNode.node.nodeSize,
          markType.create(attrsRemoveClass(currentSwitchMark, 'active'))
        )
        .removeMark(
          this.getPos() + newSwitchNode.pos + 1,
          this.getPos() + newSwitchNode.pos + 1 + newSwitchNode.node.nodeSize,
          markType
        )
        .addMark(
          this.getPos() + newSwitchNode.pos + 1,
          this.getPos() + newSwitchNode.pos + 1 + newSwitchNode.node.nodeSize,
          markType.create(attrsAddClass(newSwitchMark, 'active'))
        );
    } else {
      transaction = transaction
        .setNodeMarkup(
          this.getPos() + currentSwitchNode.pos + 1,
          null,
          attrsRemoveClass(currentSwitchNode.node, 'active')
        )
        .setNodeMarkup(
          this.getPos() + newSwitchNode.pos + 1,
          null,
          attrsAddClass(newSwitchNode.node, 'active')
        );
    }

    transaction = transaction
      .setNodeMarkup(
        this.getPos() + currentTabNode.pos + 1,
        null,
        attrsAddClass(currentTabNode.node, 'hidden')
      )
      .setNodeMarkup(
        this.getPos() + newTabNode.pos + 1,
        null,
        attrsRemoveClass(newTabNode.node, 'hidden')
      );
    this.dispatch(transaction);
  }
}

function isDivTabSwitch(node) {
  return node.type.name === 'div' &&
    node.attrs?.data?.some(([name, _]) => name === 'data-tab-switch');
}

function isMarkTabSwitch(mark) {
  return mark.type.name === 'span' &&
    mark.attrs?.data?.some(([name, _]) => name === 'data-tab-switch');
}
