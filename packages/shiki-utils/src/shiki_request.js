import { flash } from './flash';

const URLS = {
  preview: '/api/shiki_editor/preview' + (process.env.NODE_ENV === 'development' ? '?test=1' : '')
};

export default class ShikiRequest {
  constructor(origin, axios) {
    this._origin = origin;
    this.axios = axios;
  }

  get origin() {
    return this._origin;
  }

  // get(action, params) {
  //   return this.axios
  //     .get(`${this.origin}${URLS[action]}`, params)
  //     .catch(this.handleError);
  // }

  post(action, params) {
    return this.axios
      .post(`${this.origin}${URLS[action]}`, params)
      .catch(this.handleError);
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
