import DOMView from './dom_view';
import { getMarkRange } from '../utils';

export default class SpoilerInlineView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('span');
    this.contentDOM = document.createElement('span');

    this.dom.classList.add('b-spoiler_inline');
    if (this.mark.attrs.isOpened) {
      this.dom.classList.add('is-opened');
    }
    this.dom.addEventListener('click', this.toggle.bind(this));
    this.dom.appendChild(this.contentDOM);
  }

  get mark() {
    return this.node;
  }

  toggle() {
    const { dispatch, tr, view, mark } = this;
    const attrs = this.mergeAttrs({ isOpened: !mark.attrs.isOpened });
    const type = mark.type;

    const range = getMarkRange(view.state.selection.$from, type);

    dispatch(
      tr.addMark(range.from, range.to, type.create(attrs))
    );
  }
}
