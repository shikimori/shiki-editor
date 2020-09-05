import { bind } from 'shiki-decorators';
import { findChildren } from 'prosemirror-utils';
import DOMView from './dom_view';

import { serializeClassAttr, serializeDataAttr } from '../utils/div_helpers';
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
      const currentTabIndex = findIndex(
        tabNodes,
        node => node.classList.contains('active')
      ) || 0;
      const newTabIndex = findIndex(tabNodes, node => node === tabNode);

      if (newTabIndex !== currentTabIndex) {
        this.switchTab(newTabIndex, currentTabIndex);
      }
    }
  }

  switchTab(newTabIndex, currentTabIndex) {
    const switchNodes = findChildren(this.node, node => (
      node.type.name === 'div' &&
        node.attrs?.data?.some(([name, _]) => name === 'data-tab-switch')
    ));

    const tabNodes = findChildren(this.node, node => (
      node.type.name === 'div' &&
        node.attrs?.data?.some(([name, _]) => name === 'data-tab')
    ));

    // this.dispatch(
    //   this.tr
    // switchNodes[newTabIndex]

    // this.dispatch(
      // this.tr


    console.log({ newTabIndex, currentTabIndex, switchNodes, tabNodes });

  }
}
