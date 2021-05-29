// https://github.com/ueberdosis/tiptap/blob/main/packages/vue-3/src/NodeViewContent.ts
import { h, defineComponent } from 'vue';

export const NodeViewContent = defineComponent({
  props: {
    as: {
      type: String,
      default: 'div'
    }
  },

  render() {
    return h(
      this.as, {
        style: {
          whiteSpace: 'pre-wrap'
        },
        'data-node-view-content': ''
      }
    );
  }
});
