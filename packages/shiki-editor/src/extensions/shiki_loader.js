import pDefer from 'p-defer';
import axios from 'axios';

import { flash } from 'shiki-utils';
import { debounce, throttle } from 'shiki-decorators';

import { Extension } from '../base';
import fixUrl from '../utils/fix_url';

export const CACHE = {};

export class ShikiLoader extends Extension {
  queue = null
  API_PATH = 'api/shiki_editor'
  IDS_PER_REQUEST = 200

  get name() {
    return 'shiki_loader';
  }

  get defaultOptions() {
    return {
      baseUrl: undefined
    };
  }

  fetch({ id, type }) {
    const deferred = pDefer();

    this.queue ||= {};
    this.queue[convertToShikiType(type)] ||= {};
    (this.queue[convertToShikiType(type)][id] ||= []).push(deferred);

    this.sendRequest();

    return deferred.promise;
  }

  resetCache({ id, type }) {
    const kind = convertToShikiType(type);

    if (CACHE[kind]?.[id] === null) {
      delete CACHE[kind][id];
    }
  }

  @debounce(50)
  @throttle(2000)
  sendRequest() {
    const queue = this.respondFromCache(this.queue);
    this.queue = null;

    if (!Object.keys(queue).length) { return; }

    let limit = this.IDS_PER_REQUEST;

    const params = Object.keys(queue)
      .map(kind => {
        if (limit <= 0) { return; }

        const ids = Object.keys(queue[kind]).slice(0, limit);
        limit -= ids.length;

        return `${kind}=${ids.join(',')}`;
      })
      .filter(v => v)
      .join('&');

    axios
      .get(`${this.options.baseUrl}/${this.API_PATH}?${params}`)
      .then(result => this.process(queue, result?.data))
      .catch(_error => (
        flash.error(window.I18n.t('frontend.lib.please_try_again_later'))
      ));
  }

  process(queue, results) {
    Object.keys(queue).forEach(kind => {
      const queueById = queue[kind];

      Object.keys(queueById).forEach(id => {
        const promises = queueById[id];
        const result = results ? results[kind]?.[id] : null;

        if (result !== undefined) {
          if (result?.url) {
            result.url = fixUrl(result.url, this.options.baseUrl);
          }

          CACHE[kind] ||= {};
          CACHE[kind][id] ||= result;
        }

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
        const result = CACHE[kind]?.[id];

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

export function convertToShikiType(type) {
  switch (type) {
    case 'ranobe':
      return 'manga';

    case 'poster':
      return 'user_image';

    case 'image':
      return 'user_image';

    // case 'profile':
      // return 'user';

    case 'entry':
      return 'topic';

    default:
      return type;
  }
}
