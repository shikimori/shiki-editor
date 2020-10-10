import pDefer from 'p-defer';

import { debounce, throttle } from 'shiki-decorators';

import Extension from '../base/extension';
import fixUrl from '../utils/fix_url';

export const CACHE = {};
const QUEUE = {};

if (process.env.NODE_ENV !== 'test') {
  window.SHIKI_LOADER_CACHE = CACHE;
}

export class ShikiLoader extends Extension {
  IDS_PER_REQUEST = 200

  get name() {
    return 'shiki_loader';
  }

  get defaultOptions() {
    return {
      shikiRequest: undefined
    };
  }

  get origin() {
    return this.options.shikiRequest.origin;
  }

  fetch({ id, type }) {
    const deferred = pDefer();
    const kind = convertToShikiType(type);

    QUEUE[kind] ||= {};
    (QUEUE[kind][id] ||= []).push(deferred);

    this.sendRequest();

    return deferred.promise;
  }

  addToCache(kind, id, data, isType = false) {
    if (isType) {
      kind = convertToShikiType(kind); // eslint-disable-line no-param-reassign
    }

    CACHE[kind] ||= {};
    CACHE[kind][id] ||= data;
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
    this.resolveFromCache();
    if (!Object.keys(QUEUE).length) { return; }

    let idsLimit = this.IDS_PER_REQUEST;

    const idsParams = Object.keys(QUEUE).reduce((memo, kind) => {
      if (idsLimit <= 0) { return memo; }

      const ids = Object.keys(QUEUE[kind]).slice(0, idsLimit);
      idsLimit -= ids.length;

      memo[kind] = ids.join(',');
      return memo;
    }, {});

    this.options.shikiRequest.post('shiki_editor', idsParams)
      .then(result => (
        result ? this.processSuccess(result.data) : this.processError()
      ));
  }

  processSuccess(results) {
    Object.keys(results).forEach(kind => {
      Object.keys(results[kind]).forEach(id => {
        const result = results[kind][id];

        if (result !== undefined) {
          if (result?.url) {
            result.url = fixUrl(result.url, this.options.shikiRequest.origin);
          }

          this.addToCache(kind, id, result);
          this.resolve(QUEUE[kind]?.[id], result, kind, id);
        }
      });
    });

    if (Object.keys(QUEUE).length) {
      this.sendRequest();
    }
  }

  processError() {
    Object.keys(QUEUE).forEach(kind => {
      const queueById = QUEUE[kind];

      Object.keys(queueById).forEach(id => {
        const promises = queueById[id];
        promises.forEach(promise => promise.resolve(undefined));
      });
    });

    const keys = Object.keys(QUEUE);
    for (let i = 0; i < keys.length; i += 1) {
      delete QUEUE[keys[i]];
    }
  }

  resolveFromCache() {
    const toResolve = [];

    Object.keys(QUEUE).forEach(kind => {
      const queueById = QUEUE[kind];

      Object.keys(queueById).forEach(id => {
        const result = CACHE[kind]?.[id];
        if (result === undefined) { return; }

        toResolve.push({
          promises: queueById[id],
          result,
          kind,
          id
        });
      });
    });

    toResolve.forEach(({ promises, result, kind, id }) => (
      this.resolve(promises, result, kind, id)
    ));
  }

  resolve(promises, result, kind, id) {
    if (QUEUE[kind]?.[id]) {
      delete QUEUE[kind][id];
    }

    if (!Object.keys(QUEUE[kind]).length) {
      delete QUEUE[kind];
    }

    if (promises && promises.length) {
      promises.forEach(promise => promise.resolve(result));
    }
  }

  fail(promises) {
    promises.forEach(promise => promise.resolve(null));
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
