import { bind } from 'decko';
import DOMView from './dom_view';
import { getShikiLoader } from '../utils';

export default class ShikiInlineView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('span');

    this.dom.classList.add('b-ajax');
    this.dom.classList.add('vk-like');

    this.dom.innerText = this.node.attrs.bbcode;
    this.dom.addEventListener('click', this.stop);

    this.fetch();
  }

  @bind
  stop() {
    const { getPos, node, view, dispatch, tr } = this;

    dispatch(
      tr.replaceWith(
        getPos(),
        getPos() + 1,
        view.state.schema.text(node.attrs.bbcode)
      )
    );
    view.focus();
  }

  get shikiLoader() {
    return getShikiLoader(this.editor);
  }

  async fetch() {
    const result = await this.shikiLoader.fetch(this.node.attrs);
    console.log(this.node.bbcode, 'loaded', result);
  }
}
