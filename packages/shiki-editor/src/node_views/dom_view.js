export default class DOMView {
  constructor({ node, view, getPos, decorations }) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.decorations = decorations;
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
}
