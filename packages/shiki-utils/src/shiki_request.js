import flash from './flash';

const SHIKIMORI_URLS = {
  preview: '/api/shiki_editor/preview' + (process.env.NODE_ENV === 'development' ? '?test=1' : ''),
  shiki_editor: '/api/shiki_editor' + (process.env.NODE_ENV === 'development' ? '?test=1' : ''),
  autocomplete_user: '/api/users',
  smileys: '/comments/smileys'
};

const CACHE_ACTIONS = [
  'autocomplete_user'
];
const CACHE = CACHE_ACTIONS.reduce((memo, v) => {
  memo[v] = {};
  return memo;
}, {});

export default class ShikiRequest {
  constructor(origin, axios) {
    this._origin = origin;
    this.axios = axios;
  }

  get origin() {
    return this._origin;
  }

  get(action, params) {
    return this.withCache(action, params, () => (
      this.axios
        .get(this.urlFor(action), { params })
        .catch(this.handleError)
    ));
  }

  post(action, params) {
    return this.withCache(action, params, () => (
      this.axios
        .post(this.urlFor(action), params)
        .catch(this.handleError)
    ));
  }

  autocomplete(kind, search, limit = 5) {
    return this.get(
      `autocomplete_${kind}`,
      { search, page: 1, limit }
    );
  }

  async withCache(action, params, request) {
    if (CACHE_ACTIONS.includes(action)) {
      const key = JSON.stringify(params);

      if (CACHE[action][key]) {
        return Promise.resolve(CACHE[action][key]);
      } else {
        const response = await request();
        CACHE[action][key] = response;
        return Promise.resolve(response);
      }

    } else {
      return request();
    }
  }

  urlFor(action) {
    const path = SHIKIMORI_URLS[action];

    if (!path) {
      throw `unknown action: ${action}`;
    }

    return `${this.origin}${path}`;
  }

  handleError(error) {
    if (process.env.NODE_ENV === 'development') {
      let devError = error?.response?.data;
      if (devError) {
        devError = devError.split('\n').slice(0, 6).join('<br>');
      }
      flash.error(devError || error.message);
    } else {
      flash.error(window.I18n.t('frontend.lib.please_try_again_later'));
    }
    return { data: null };
  }
}
