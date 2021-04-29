import imagePromise from 'image-promise';
import { bind } from 'shiki-decorators';

import DOMView from './dom_view';
import { getShikiLoader } from '../utils';
import { addToShikiCache } from '../extensions';

export default class VideoView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('span');

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

    const isValid = !attrs.isLoading && !attrs.isError;

    dom.classList.toggle('b-video', isValid);
    dom.classList.toggle('b-shiki_editor-node', !isValid);
    dom.classList.toggle('b-ajax', attrs.isLoading);
    dom.classList.toggle('vk-like', attrs.isLoading);
    dom.classList.toggle('is-error', attrs.isError);

    dom.innerText = '';

    if (attrs.isLoading || !attrs.hosting) {
      const bbcode = document.createElement('span');
      bbcode.innerText = attrs.bbcode;
      bbcode.addEventListener('click', this.linkClick);
      dom.appendChild(bbcode);
    } else {
      dom.setAttribute('data-video', attrs.bbcode);
      dom.setAttribute('data-attrs', JSON.stringify(attrs));
      dom.classList.add(attrs.hosting);
      dom.classList.add('fixed');

      if (attrs.hosting === 'youtube' && attrs.isBroken) {
        dom.classList.add('shrinked-1_3');
      }

      const link = document.createElement('a');
      link.classList.add('video-link');
      link.href = attrs.url;
      link.addEventListener('click', this.linkClick);

      const img = document.createElement('img');
      img.src = attrs.isBroken ?
        this.shikiLoader.origin + '/assets/globals/missing_video.png' :
        attrs.poster;

      imagePromise(img).then(this.checkImage);

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
    this.replaceWith(
      this.view.state.schema.text(
        this.node.attrs.url,
        [
          ...this.node.marks,
          this.view.state.schema.marks.link_inline.create({
            text: this.node.attrs.url,
            url: this.node.attrs.url
          }, null, this.node.marks)
        ]
      ),
      false
    );
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

  @bind
  checkImage(imagesLoaded) {
    const [img] = imagesLoaded.elements;

    if (this.node.attrs.hosting === 'youtube' &&
      img.naturalWidth === 120 && img.naturalHeight === 90
    ) {
      const shikiData = {
        id: this.node.attrs.url,
        hosting: this.node.attrs.hosting,
        poster: this.node.attrs.poster,
        isBroken: true
      };

      addToShikiCache('video', this.node.attrs.url, shikiData);
      this.updateAttrs({ isBroken: true }, false);

      return;
    }

    const ratio = Math.round(
      (img.naturalWidth * 1.0) / img.naturalHeight * 10.0
    ) / 10.0;

    // http://vk.com/video98023184_165811692
    if (ratio === 1.3) {
      this.dom.classList.add('shrinked-1_3');
    }

    // https://video.sibnet.ru/video305613-SouL_Eater__AMW/
    if (ratio === 1.5) {
      this.dom.classList.add('shrinked-1_5');
    }
  }
}
