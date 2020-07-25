import { bind } from 'decko';
import { DOMSerializer } from 'prosemirror-model';

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
    } else {
      this.dom.addEventListener('click', this.focus);
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
    const result = await this.shikiLoader.fetch(this.node.attrs);
    if (this.isDestroyed) { return; }

    if (result) {
      this.success(result);
    } else {
      this.error();
    }
  }

  // fetch() {
  //   this.shikiLoader.fetch(this.node.attrs).then(result => {
  //     if (this.isDestroyed) { return; }
  // 
  //     if (result) {
  //       this.success(result);
  //     } else {
  //       this.error();
  //     }
  //   });
  // }

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
    const selection = this.nodeSelection;
    this.replaceWith(this.node.content, false);

    const pos = this.view.state.tr.doc.resolve(selection.$from.pos);

    this.view.dispatch(
      this.view.state.tr
        .setMeta('addToHistory', false)
        .addMark(
          pos.start(),
          pos.end(),
          this.markLinkInline(result)
        )
    );
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
