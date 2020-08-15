const globalIds = {};

export default class RequestId {
  key = undefined;
  id = undefined;

  constructor(key) {
    if (!globalIds[key]) {
      globalIds[key] = 0;
    }
    globalIds[key] += 1;

    this.key = key;
    this.id = globalIds[key];
  }

  get isCurrent() {
    return this.id === globalIds[this.key];
  }
}
