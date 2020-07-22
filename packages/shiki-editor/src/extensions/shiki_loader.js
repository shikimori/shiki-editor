import pDefer from 'p-defer';
import { Extension } from '../base';

export default class ShikiLoader extends Extension {
  data = {}
  requests = {}

  get name() {
    return 'shiki_loader';
  }

  fetch({ id, type }) {
    const deferred = pDefer();

    requests[type] ||= {}
    (requests[type][id] ||= []).push(deferred);

    return deferred.promise;
  }
}
