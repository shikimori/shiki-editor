export default class ShikiRequest {
  constructor(origin, axios) {
    this.origin = origin;
    this.axios = axios;
  }

  get origin() {
    return this.origin;
  }

  get previewUrl() {
    return `${this.origin}/api/shiki_editor/preview` +
      (process.env.NODE_ENV === 'development' ? '?test=1' : '');
  }
}
