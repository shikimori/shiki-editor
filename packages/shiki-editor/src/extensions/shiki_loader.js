import pDefer from 'p-defer';
import { Extension } from '../base';
import debounce from 'debounce-decorator';

export default class ShikiLoader extends Extension {
  data = {}
  queue = null

  get name() {
    return 'shiki_loader';
  }

  fetch({ id, type }) {
    const deferred = pDefer();

    this.queue ||= {};
    this.queue[type] ||= {};
    (this.queue[type][id] ||= []).push(deferred);

    this.sendRequest();

    return deferred.promise;
  }

  @debounce(50)
  sendRequest() {
    const { queue } = this;
    this.queue = null;

    console.log(queue);
  }
}
