import { flash } from './flash';

const SHIKIMORI_URLS = {
  preview: '/api/shiki_editor/preview' + (process.env.NODE_ENV === 'development' ? '?test=1' : ''),
  autocomplete_user: '/api/users'
};

export default class ShikiRequest {
  constructor(origin, axios) {
    this._origin = origin;
    this.axios = axios;
  }

  get origin() {
    return this._origin;
  }

  get(action, params) {
    return this.axios
      .get(this.urlFor(action), { params })
      .catch(this.handleError);
  }

  post(action, params) {
    return this.axios
      .post(this.urlFor(action), params)
      .catch(this.handleError);
  }

  autocomplete(kind, search) {
    return this.get(
      `autocomplete_${kind}`,
      { search, page: 1, limit: 10 }
    );
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
      flash.error(I18n.t('frontend.lib.please_try_again_later'));
    }
    return { data: null };
  }
}
