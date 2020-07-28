import { bind } from 'decko';
import { DOMSerializer } from 'prosemirror-model';

import DOMView from './dom_view';
import { getShikiLoader } from '../utils';

export default class ShikiView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement(this.elementType);
    this.appendLoader();

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

  get elementType() {
    return this.isInline ? 'span' : 'div';
  }

  get isInline() {
    return this.extension.schema.group === 'inline';
  }

  appendLoader() {
    this.dom.classList.add('b-shiki_editor-node');
    this.dom.classList.toggle('b-ajax', this.node.attrs.isLoading);
    this.dom.classList.toggle('vk-like', this.node.attrs.isLoading);
    this.dom.classList.toggle('is-error', this.node.attrs.isError);

    const domSerializer = DOMSerializer.fromSchema(this.editor.schema);

    if (this.isInline) {
      if (this.node.attrs.text) {
        this.dom.append(this.node.attrs.openBbcode);
        this.dom.appendChild(
          domSerializer.serializeFragment(this.node.content)
        );
        this.dom.append(this.node.attrs.closeBbcode);
      } else {
        this.dom.innerText = this.node.attrs.bbcode;
      }
    } else {
      const openBbcode = document.createElement('div');
      const content = document.createElement('div');
      const closeBbcode = document.createElement('div');
      openBbcode.innerText = this.node.attrs.openBbcode;
      closeBbcode.innerText = this.node.attrs.closeBbcode;

      content.appendChild(
        domSerializer.serializeFragment(this.node.content)
      );

      this.dom.appendChild(openBbcode);
      this.dom.appendChild(content);
      this.dom.appendChild(closeBbcode);
    }
  }

  // rerender node view every time on any update
  update() { return false; }

  @bind
  stop() {
    this.updateAttrs({ isLoading: false });
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
    } else if (result === undefined) {
      // undefined means that results were paginated and we have
      // to ask the server once again
      this.fetch();
    } else {
      this.error();
    }
  }

  success(result) {
    if (this.type === 'poster' || this.type === 'image') {
      this.replaceImage(result);
    } else if (this.node.attrs.text) {
      this.replaceFragment(result);
    } else if (this.isInline) {
      this.replaceDefaultLink(result);
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
    const contentSize = this.node.content.size;

    this.view.dispatch(
      this.view.state.tr
        .setMeta('addToHistory', false)
        .replaceWith(selection.from, selection.to, this.node.content)
        .addMark(
          selection.from,
          selection.from + contentSize,
          this.markLinkInline(result)
        )
    );
  }

  replaceDefaultLink(result) {
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

  replaceNode(result) {
    this.replaceWith(
      this.view.state.schema.nodes.link_block.create({
        ...result,
        type: this.type,
        nBeforeOpen: this.node.attrs.nBeforeOpen,
        nAfterOpen: this.node.attrs.nAfterOpen,
        nBeforeClose: this.node.attrs.nBeforeClose
      }, this.node.content)
    );
  }

  markLinkInline(result) {
    return this.view.state.schema.marks.link_inline.create({
      ...result,
      type: this.type
    });
  }

  error() {
    this.updateAttrs({
      isLoading: false,
      isError: true
    });
  }
}
