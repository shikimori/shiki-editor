import { bind } from 'shiki-decorators';
import NodeView from '../node_view';

export default class SpoilerInlineView extends NodeView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('span');
    this.contentDOM = document.createElement('span');

    this.syncState();

    this.dom.classList.add('b-spoiler_inline');
    this.dom.setAttribute('tabindex', 0);
    this.dom.addEventListener('click', this.toggle);
    this.dom.addEventListener('keypress', this.keypress);
    this.dom.appendChild(this.contentDOM);
  }

  get mark() {
    return this.node;
  }

  get isOpened() {
    return this.mark.attrs.isOpened;
  }

  syncState() {
    this.dom.classList.toggle('is-opened', this.isOpened);
  }

  @bind
  toggle() {
    if (!this.view.state.selection.empty) { return; }

    this.updateAttrs({ isOpened: !this.isOpened });
    this.syncState();
  }

  @bind
  keypress(e) {
    switch (e.keyCode) {
      case 32: // space
      case 13: //enter
        this.toggle(e);
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
    }
  }
}
