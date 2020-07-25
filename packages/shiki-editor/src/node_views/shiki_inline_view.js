import { bind } from 'decko';
import { DOMSerializer } from 'prosemirror-model';

import DOMView from './dom_view';
import { getShikiLoader } from '../utils';

export default class ShikiInlineView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('span');

    // this.dom.setAttribute('tabindex', 0);
    this.dom.classList.add('b-shiki_editor-node');

    if (this.node.attrs.isLoading) {
      this.dom.classList.add('b-ajax');
      this.dom.classList.add('vk-like');
    }
    if (this.node.attrs.isError) {
      this.dom.classList.add('is-error');
    }

    const domSerializer = DOMSerializer.fromSchema(this.editor.schema);

    if (this.node.attrs.text) {
      this.dom.append(this.node.attrs.openBbcode);
      this.dom.appendChild(
        domSerializer.serializeFragment(options.node.content)
      );
      this.dom.append(this.node.attrs.closeBbcode);
    } else {
      this.dom.innerText = this.node.attrs.bbcode;
    }

    if (this.node.attrs.isLoading) {
      this.fetch();
      this.dom.addEventListener('click', this.stop);
      // this.dom.addEventListener('focus', this.focus);
    } else {
      this.dom.addEventListener('click', this.focus);
      // this.dom.addEventListener('focus', this.focus);
    }
  }

  get type() {
    return this.node.attrs.type;
  }

  @bind
  stop() {
    this.updateAttrs({ isLoading: false });

    // this.replaceWith(
    //   this.view.state.schema.text(
    //     this.node.attrs.bbcode,
    //     this.node.marks
    //   )
    // );

    this.view.focus();
  }

  get shikiLoader() {
    return getShikiLoader(this.editor);
  }

  async fetch() {
    // console.log('fetch');
    const result = await this.shikiLoader.fetch(this.node.attrs);
    if (this.isDestroyed) { return; }

    if (result) {
      this.success(result);
    } else {
      this.error();
    }
  }

  success(result) {
    // console.log('success');
    if (this.type === 'poster' || this.type === 'image') {
      this.replaceImage(result);
    } else if (this.node.attrs.text) {
      this.replaceFragment(result);
    } else {
      this.replaceNode(result);
    }
  }

  replaceImage(result) {
    this.replaceWith(
      this.view.state.schema.nodes.image.create({
        id: result.id,
        src: result.url,
        isPoster: this.type === 'poster',
        ...this.node.attrs.meta
      }),
      false
    );
  }

  replaceFragment(result) {
    const { dispatch, tr } = this;
    const selection = this.nodeSelection;

    dispatch(
      tr
        .setMeta('addToHistory', false)
        .addMark(
          selection.$from.pos,
          selection.$to.pos,
          this.markLinkInline(result)
        )
    );

    // this.replaceWith(this.node.content, false);
  }

  replaceNode(result) {
    this.replaceWith(
      this.view.state.schema.text(
        result.text,
        [
          ...this.node.marks,
          this.markLinkInline(result)
        ]
      ),
      false
    );
  }

  markLinkInline(result) {
    return this.view.state.schema.marks.link_inline.create({
      ...result,
      type: this.type
    });
  }

  error() {
    const { getPos, dispatch, tr } = this;
    const attrs = this.mergeAttrs({ isLoading: false, isError: true });

    dispatch(
      tr
        .setMeta('addToHistory', false)
        .setNodeMarkup(getPos(), null, attrs)
    );
  }
}
