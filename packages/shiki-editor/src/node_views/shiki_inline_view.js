import { bind } from 'decko';
import DOMView from './dom_view';
import { getShikiLoader } from '../utils';

export default class ShikiInlineView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('span');

    this.dom.classList.add('b-shiki_editor-node');

    if (this.node.attrs.isLoading) {
      this.dom.classList.add('b-ajax');
      this.dom.classList.add('vk-like');
    }
    if (this.node.attrs.isError) {
      this.dom.classList.add('is-error');
    }

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
    if (result) {
      console.log(this.node.bbcode, 'loaded', result);
    } else {
      this.error();
    }
  }

  error() {
    const { getPos, view, dispatch, tr } = this;
    const attrs = this.mergeAttrs({ isLoading: false, isError: true });

    dispatch(
      tr.setNodeMarkup(getPos(), null, attrs)
    );
    view.focus();
  }
}
