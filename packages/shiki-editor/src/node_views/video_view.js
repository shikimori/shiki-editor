import DOMView from './dom_view';
import { getShikiLoader } from '../utils';

export default class VideoView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('span');
    this.dom.classList.add('b-video');

    this.syncState();

    if (this.node.attrs.isLoading) {
      this.appendContent();
      this.fetch();
    }
  }

  get shikiLoader() {
    return getShikiLoader(this.editor);
  }

  syncState() {
    this.dom.classList.toggle('b-ajax', this.node.attrs.isLoading);
    this.dom.classList.toggle('vk-like', this.node.attrs.isLoading);
    this.dom.classList.toggle('is-error', this.node.attrs.isError);
    this.dom.classList.toggle('b-entry-404', this.node.attrs.isNotFound);

    console.log('syncState')
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

  appendContent() {
    this.dom.innerText = this.node.attrs.bbcode;
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
