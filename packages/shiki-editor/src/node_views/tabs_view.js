import { bind } from 'shiki-decorators';
import DOMView from './dom_view';

import { serializeClassAttr, serializeDataAttr } from '../utils/div_helpers';
import { findNode, findParent, findIndex } from '../utils/dom_helpers';

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
      const currentTabIndex = findIndex(
        findNode(
          tabNode.parentNode,
          node => node.getAttribute('data-tab-switch') != null &&
            node.classList.contains('active')
        )
      ) || 0;
      const newTabIndex = findIndex(tabNode);

      if (newTabIndex) {
        this.switchTab(newTabIndex, currentTabIndex);
      }
    }
  }

  switchTab(newTabIndex, currentTabIndex) {
    console.log(newTabIndex, currentTabIndex, this.node.content.content);
  }
}
