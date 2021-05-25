// https://github.com/ueberdosis/tiptap/blob/main/packages/vue-3/src/VueRenderer.ts
import { reactive, markRaw } from 'vue';

export default class VueRenderer {
  id = null
  editor = null
  component = null
  teleportElement = null
  element = null
  props = null

  constructor(component, { props = {}, editor }) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString();
    this.editor = editor;
    this.component = markRaw(component);
    this.teleportElement = document.createElement('div');
    this.element = this.teleportElement;
    this.props = reactive(props);
    this.editor.vueRenderers.set(this.id, this);

    if (this.editor.contentComponent) {
      this.editor.contentComponent.update();

      if (this.teleportElement.children.length !== 1) {
        throw Error('VueRenderer doesn’t support multiple child elements.');
      }

      this.element = this.teleportElement.firstElementChild;
    }
  }

  ref() {
    return this.editor.contentComponent?.refs[this.id];
  }

  updateProps(props) {
    Object
      .entries(props)
      .forEach(([key, value]) => {
        this.props[key] = value;
      });
  }

  destroy() {
    this.editor.vueRenderers.delete(this.id);
  }
}
