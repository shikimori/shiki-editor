import { bind } from 'shiki-decorators';
import { findChildren } from 'prosemirror-utils';
import DOMView from './dom_view';

import {
  serializeClassAttr,
  serializeDataAttr,
  addClass,
  removeClass
} from '../utils/div_helpers';
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

    this.dom.addEventListener('click', this.click, true);
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
    const switchNodes = findChildren(this.node, node => (
      node.type.name === 'div' &&
        node.attrs?.data?.some(([name, _]) => name === 'data-tab-switch')
    ));

    const tabNodes = findChildren(this.node, node => (
      node.type.name === 'div' &&
        node.attrs?.data?.some(([name, _]) => name === 'data-tab')
    ));

    const newSwitchNode = switchNodes[newIndex];
    const currentSwitchNode = switchNodes[currentIndex];

    // const switchNodes2 = [];
    // this.node.descendants((node, pos) => {
    //   // if (node === newSwitchNode) found = {node, pos}
    //   if (
    //     node.type.name === 'div' &&
    //       node.attrs?.data?.some(([name, _]) => name === 'data-tab-switch')
    //   ) switchNodes2.push({ node, pos });
    // });
    // debugger

    // console.log({
    //   getPos: this.getPos(),
    //   currentSwitchNode: currentSwitchNode.pos,
    //   newSwitchNode: newSwitchNode.pos
    // });
    // console.log({
    //   node: this.node,
    //   newIndex,
    //   currentIndex,
    //   switchNodes,
    //   tabNodes,
    //   newSwitchNode,
    //   currentSwitchNode,
    //   getPos: this.getPos()
    // });
    // debugger

    this.dispatch(
      this.tr
        .setMeta('addToHistory', false)
        .setNodeMarkup(
          this.getPos() + currentSwitchNode.pos + 1,

          null,
          {
            ...currentSwitchNode.node.attrs,
            class: removeClass(currentSwitchNode.node.attrs.class, 'active')
          }
        )
        .setNodeMarkup(
          this.getPos() + newSwitchNode.pos + 1,
          null,
          {
            ...newSwitchNode.node.attrs,
            class: addClass(newSwitchNode.node.attrs.class, 'active')
          }
        )
    );
  }
}
