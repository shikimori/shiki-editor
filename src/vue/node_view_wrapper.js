// https://github.com/ueberdosis/tiptap/blob/main/packages/vue-3/src/NodeViewWrapper.ts
import { h, defineComponent } from 'vue';

export const NodeViewWrapper = defineComponent({
  inject: ['onDragStart', 'decorationClasses'],

  props: {
    as: {
      type: String,
      default: 'div'
    }
  },

  render() {
    return h(
      this.as, {
        class: this.decorationClasses.value,
        style: {
          whiteSpace: 'normal'
        },
        'data-vue-node-view-wrapper': '',
        onDragStart: this.onDragStart
      },
      this.$slots.default?.()
    );
  }
});
