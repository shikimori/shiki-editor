import pDefer from 'p-defer';
import debounce from 'debounce-decorator';
import axios from 'axios';

import { flash } from 'shiki-utils';

import { Extension } from '../base';
import fixUrl from '../utils/fix_url';

export const CACHE = {};

export class ShikiLoader extends Extension {
  queue = null
  API_PATH = 'api/shiki_editor'

  get name() {
    return 'shiki_loader';
  }

  get defaultOptions() {
    return { baseUrl: undefined };
  }

  fetch({ id, type }) {
    const deferred = pDefer();

    this.queue ||= {};
    this.queue[fixedType(type)] ||= {};
    (this.queue[fixedType(type)][id] ||= []).push(deferred);

    this.sendRequest();

    return deferred.promise;
  }

  @debounce(50)
  async sendRequest() {
    const queue = this.respondFromCache(this.queue);
    this.queue = null;

    if (!Object.keys(queue).length) { return; }

    const params = Object.keys(queue)
      .map(kind => `${kind}=${Object.keys(queue[kind]).join(',')}`)
      .join('&');

    const result = await axios
      .get(`${this.options.baseUrl}/${this.API_PATH}?${params}`)
      .catch(_error => (
        flash.error(window.I18n.t('frontend.lib.please_try_again_later'))
      ));

    this.process(queue, result?.data);
  }

  process(queue, results) {
    Object.keys(queue).forEach(kind => {
      const queueById = queue[kind];

      Object.keys(queueById).forEach(id => {
        const promises = queueById[id];
        const result = results?.[kind].find(v => v.id === parseInt(id));

        if (result.url) {
          result.url = fixUrl(result.url, this.options.baseUrl);
        }

        CACHE[kind] ||= {};
        CACHE[kind][id] ||= (result || null);

        promises.forEach(promise => promise.resolve(result));
      });
    });
  }

  respondFromCache(queue) {
    const requestQueue = {};

    Object.keys(queue).forEach(kind => {
      const queueById = queue[kind];

      Object.keys(queueById).forEach(id => {
        const promises = queueById[id];
        const result = CACHE?.[kind]?.[id];

        if (result !== undefined) {
          promises.forEach(promise => promise.resolve(result));
        } else {
          requestQueue[kind] ||= {};
          requestQueue[kind][id] = promises;
        }
      });
    });

    return requestQueue;
  }
}

export function fixedType(type) {
  if (type === 'ranobe') {
    return 'manga';
  } else if (type === 'poster') {
    return 'user_image';
  } else if (type === 'image') {
    return 'user_image';
  } else {
    return type;
  }
}
