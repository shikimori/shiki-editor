import { bind } from 'shiki-decorators';
import DOMView from './dom_view';
// import { getMarkRange } from '../utils';

export default class SpoilerInlineView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('span');
    this.contentDOM = document.createElement('span');

    this.syncState();

    this.dom.classList.add('b-spoiler_inline');
    this.dom.addEventListener('click', this.toggle);
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
}
