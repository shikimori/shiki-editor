import { bind } from 'shiki-decorators';

import DOMView from './dom_view';
import { getShikiLoader } from '../utils';

export default class VideoView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('span');
    this.dom.classList.add('b-video');

    this.syncState();

    if (this.node.attrs.isLoading) {
      this.fetch();
    }
  }

  get shikiLoader() {
    return getShikiLoader(this.editor);
  }

  syncState() {
    const { dom, node } = this;
    const { attrs } = node;

    dom.classList.toggle('b-ajax', attrs.isLoading);
    dom.classList.toggle('vk-like', attrs.isLoading);
    dom.classList.toggle('is-error', attrs.isError);
    dom.classList.toggle('b-entry-404', attrs.isNotFound);

    if (attrs.isLoading || !attrs.hosting) {
      dom.innerText = attrs.bbcode;
    } else {
      dom.innerText = '';
      dom.setAttribute('data-video', attrs.bbcode);
      dom.setAttribute('data-attrs', JSON.stringify(attrs));
      dom.classList.add(attrs.hosting);
      dom.classList.add('fixed');
      if (attrs.hosting === 'youtube' || attrs.hosting === 'vk') {
        dom.classList.add('shrinked');
      }

      const link = document.createElement('a');
      link.classList.add('video-link');
      link.href = attrs.url;
      link.addEventListener('click', this.linkClick);

      const img = document.createElement('img');
      img.src = attrs.poster;

      const marker = document.createElement('span');
      marker.classList.add('marker');
      marker.innerText = attrs.hosting;

      const controls = document.createElement('div');
      controls.classList.add('controls');

      const del = document.createElement('div');
      del.classList.add('delete');
      del.addEventListener('click', this.deleteClick);

      const open = document.createElement('a');
      open.classList.add('prosemirror-open');
      open.setAttribute('target', '_blank');
      open.setAttribute('href', attrs.url);

      link.appendChild(img);
      controls.appendChild(open);
      controls.appendChild(del);

      dom.appendChild(controls);
      dom.appendChild(link);
      dom.appendChild(marker);
    }
  }

  async fetch() {
    const result = await this.shikiLoader.fetch({
      id: this.node.attrs.url,
      type: 'video'
    });

    if (this.isDestroyed || !this.node.attrs.isLoading) { return; }

    if (result) {
      this.success(result);
    } else if (result === undefined) {
      // undefined means that error happened
      this.error();
    } else {
      this.notFound();
    }
  }

  success(result) {
    if (result.id) {
      this.updateAttrs({ ...result, isLoading: false }, false);
    } else {
      this.notFound();
    }
  }

  notFound() {
    this.updateAttrs({ isLoading: false, isNotFound: true }, false);
  }

  error() {
    this.updateAttrs({ isLoading: false, isError: true }, false);
  }

  @bind
  linkClick(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    this.focus(true);
  }

  @bind
  deleteClick(e) {
    e.stopImmediatePropagation();

    this.view.dispatch(
      this.view.state.tr.delete(
        this.getPos(),
        this.getPos() + 1
      )
    );
    this.editor.focus();
  }
}
