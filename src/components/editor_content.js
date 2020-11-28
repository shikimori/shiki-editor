// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap/src/Components/EditorContent.js
export default {
  props: {
    editor: { type: Object, required: true }
  },
  watch: {
    editor: {
      immediate: true,
      handler(editor) {
        if (editor && editor.element) {
          this.$nextTick(() => {
            this.$el.appendChild(editor.element.firstChild);
            editor.setParentComponent(this);
          });
        }
      }
    }
  },
  render(createElement) {
    return createElement('div');
  },
  beforeDestroy() {
    this.editor.element = this.$el;
  }
};
