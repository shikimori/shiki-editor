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

    console.log('syncState', dom);

    dom.classList.toggle('b-ajax', attrs.isLoading);
    dom.classList.toggle('vk-like', attrs.isLoading);
    dom.classList.toggle('is-error', attrs.isError);
    dom.classList.toggle('b-entry-404', attrs.isNotFound);

    if (attrs.isLoading || !attrs.hosting) {
      dom.innerText = attrs.bbcode;
    } else {
      dom.innerText = '';
      dom.classList.add(attrs.hosting);
      dom.classList.add('fixed');
      if (attrs.hosting === 'youtube' || attrs.hosting === 'vk') {
        dom.classList.add('shrinked');
      }

      const link = document.createElement('a');
      link.classList.add('video-link');
      link.href = attrs.url;

      const img = document.createElement('img');
      img.src = attrs.poster;

      const marker = document.createElement('span');
      marker.classList.add('marker');
      marker.innerText = attrs.hosting;

      link.appendChild(img);
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
}
