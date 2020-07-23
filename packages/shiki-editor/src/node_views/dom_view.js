export default class DOMView {
  node = null
  view = null
  getPos = null
  decorations = null
  editor = null
  isDestroyed = false

  constructor({ node, view, getPos, decorations, editor }) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.decorations = decorations;
    this.editor = editor;
  }

  get dispatch() {
    return this.view.dispatch;
  }

  get tr() {
    return this.view.state.tr;
  }

  mergeAttrs(attrs) {
    return { ...this.node.attrs, ...attrs };
  }

  replaceWith(replacement, isAddToHistory=true) {
    const { getPos, dispatch, tr } = this;

    dispatch(
      tr
        .setMeta('addToHistory', isAddToHistory)
        .replaceWith(getPos(), getPos() + 1, replacement)
    );
  }

  destroy() {
    this.isDestroyed = true;
  }
}
