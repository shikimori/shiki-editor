import pDefer from 'p-defer';
import { Extension } from '../base';

export default class ShikiLoader extends Extension {
  cache = {}

  get name() {
    return 'shiki_loader';
  }

  fetch({ id, type }) {
    const deferred = pDefer();
    return deferred.promise;
  }
}
