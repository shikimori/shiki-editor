export default class DOMView {
  node = null
  view = null
  getPos = null
  decorations = null
  editor = null

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

  replaceWith(replacement) {
    const { getPos, view, dispatch, tr } = this;

    dispatch(
      tr.replaceWith(
        getPos(),
        getPos() + 1,
        replacement
      )
    );
    view.focus();
  }
}
