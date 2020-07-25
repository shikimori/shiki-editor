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

  updateAttrs(attrs) {
    const { state } = this.view;
    const { type } = this.node;
    const pos = this.getPos();
    const newAttrs = {
      ...this.node.attrs,
      ...attrs
    };
    const transaction = this.isMark ?
      state.tr
        .removeMark(pos.from, pos.to, type)
        .addMark(pos.from, pos.to, type.create(newAttrs)) :
      state.tr.setNodeMarkup(pos, null, newAttrs);

    this.view.dispatch(transaction);
  }

  destroy() {
    this.isDestroyed = true;
  }
}
