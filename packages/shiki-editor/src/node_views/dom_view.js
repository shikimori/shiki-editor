import { bind } from 'shiki-decorators';
import { NodeSelection } from 'prosemirror-state';
import { getMarkRange } from '../utils';

export default class DOMView {
  node = null
  extension = null
  isNode = null
  isMark = null
  view = null
  getPos = null
  decorations = null
  editor = null
  isDestroyed = false
  isSelected = false
  captureEvents = true

  constructor({ node, extension, view, getPos, decorations, editor }) {
    this.node = node;
    this.extension = extension;
    this.isNode = !!this.node.marks;
    this.isMark = !this.isNode;
    this.view = view;
    this.getPos = this.isMark ? this.getMarkPos : getPos;
    this.decorations = decorations;
    this.editor = editor;
  }

  get dispatch() {
    return this.view.dispatch;
  }

  get tr() {
    return this.view.state.tr;
  }

  get nodeSelection() {
    return new NodeSelection(this.tr.doc.resolve(this.getPos()));
  }

  @bind
  focus() {
    const { dispatch, tr } = this;

    dispatch(
      tr.setSelection(this.nodeSelection)
    );
  }

  mergeAttrs(attrs) {
    return { ...this.node.attrs, ...attrs };
  }

  replaceWith(replacement, isAddToHistory = true) {
    const { dispatch, tr } = this;
    const selection = this.nodeSelection;

    dispatch(
      tr
        .setMeta('addToHistory', isAddToHistory)
        .replaceWith(selection.$from.pos, selection.$to.pos, replacement)
    );
  }

  update(node, decorations) {
    if (node.type !== this.node.type) {
      return false;
    }

    if (node === this.node && this.decorations === decorations) {
      return true;
    }

    this.node = node;
    this.decorations = decorations;

    return this.syncState() !== false;
  }

  // must be overriden in inherited class
  syncState() {
  }

  // disable (almost) all prosemirror event listener for node views
  stopEvent(event) {
    if (typeof this.extension.stopEvent === 'function') {
      return this.extension.stopEvent(event);
    }

    const draggable = !!this.extension.schema.draggable;

    // support a custom drag handle
    if (draggable && event.type === 'mousedown') {
      const dragHandle = event.target.closest &&
        event.target.closest('[data-drag-handle]');
      const isValidDragHandle = dragHandle &&
        (this.dom === dragHandle || this.dom.contains(dragHandle));

      if (isValidDragHandle) {
        this.captureEvents = false;
        document.addEventListener('dragend', () => {
          this.captureEvents = true;
        }, { once: true });
      }
    }

    const isCopy = event.type === 'copy';
    const isPaste = event.type === 'paste';
    const isCut = event.type === 'cut';
    const isDrag = event.type.startsWith('drag') || event.type === 'drop';

    if ((draggable && isDrag) || isCopy || isPaste || isCut) {
      return false;
    }

    return this.captureEvents;
  }

  updateAttrs(attrs, isAddToHistory = true) {
    const { state } = this.view;
    const { type } = this.node;
    const pos = this.getPos();
    const newAttrs = {
      ...this.node.attrs,
      ...attrs
    };
    let transaction = state.tr.setMeta('addToHistory', isAddToHistory);

    if (this.isMark) {
      transaction = transaction
        .removeMark(pos.from, pos.to, type)
        .addMark(pos.from, pos.to, type.create(newAttrs));
    } else {
      transaction = transaction.setNodeMarkup(pos, null, newAttrs);
    }

    this.view.dispatch(transaction);
  }

  getMarkPos() {
    const pos = this.view.posAtDOM(this.dom);
    const resolvedPos = this.view.state.doc.resolve(pos);
    const range = getMarkRange(resolvedPos, this.node.type);
    return range;
  }

  destroy() {
    this.isDestroyed = true;
  }
}
