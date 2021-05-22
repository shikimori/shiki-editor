// https://github.com/ueberdosis/tiptap/blob/main/packages/vue-3/src/Editor.ts
import Editor from '../editor';

import {
  markRaw,
  customRef,
  reactive
} from 'vue';

function useDebouncedRef(value) {
  return customRef((track, trigger) => ({
    get() {
      track();
      return value;
    },
    set(newValue) {
      // update state
      value = newValue; // eslint-disable-line no-param-reassign

      // update view as soon as possible
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          trigger();
        });
      });
    }
  }));
}

export default class VueEditor extends Editor {
  reactiveState = null
  contentComponent = null
  vueRenderers = reactive(new Map())

  constructor(options) {
    super(options);

    this.reactiveState = useDebouncedRef(this.view.state);

    this.on('transaction', this.syncReactiveState);
    this.on('selectionUpdate', this.syncReactiveState);

    markRaw(this);
  }

  get state() {
    return this.reactiveState ?
      this.reactiveState.value :
      this.view.state;
  }

  syncReactiveState() {
    this.reactiveState.value = this.view.state;
  }

  registerPlugin(plugin, handlePlugins) {
    super.registerPlugin(plugin, handlePlugins);
    this.reactiveState.value = this.view.state;
  }

  unregisterPlugin(nameOrPluginKey) {
    super.unregisterPlugin(nameOrPluginKey);
    this.reactiveState.value = this.view.state;
  }

  // destroy() {
  //   this.reactiveState.value = null;
  //   super.destroy();
  // }
}
