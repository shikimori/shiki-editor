import { bind } from 'shiki-decorators';
import { NodeSelection } from 'prosemirror-state';
import { getMarkRange, isiOS } from './utils';

export class NodeView {
  component = null
  editor = null
  node = null
  extension = null
  view = null
  getPos = null
  decorations = null
  isDragging = false
  isDestroyed = false
  isSelected = false
  captureEvents = true

  constructor(component, { node, extension, view, getPos, decorations, editor }) {
    this.component = component;
    this.node = node;
    this.extension = extension;
    this.view = view;
    this.getPos = this.isMark ? this.getMarkPos : getPos;
    this.decorations = decorations;
    this.editor = editor;

    this.mount();
  }

  get isNode() {
    return !!this.node?.marks;
  }

  get isMark() {
    return !this.isNode;
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

  mount() {
  }

  @bind
  focus(isFocusEditor) {
    if (isFocusEditor) {
      this.editor.focus();
    }

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

  updateAttrs(attrs, isAddToHistory = true) {
    const { type } = this.node;
    const pos = this.getPos();

    const newAttrs = {
      ...this.node.attrs,
      ...attrs
    };
    let transaction = this.tr.setMeta('addToHistory', isAddToHistory);

    if (this.isMark) {
      transaction = transaction
        .removeMark(pos.from, pos.to, type)
        .addMark(pos.from, pos.to, type.create(newAttrs));
    } else {
      transaction = transaction.setNodeMarkup(pos, null, newAttrs);
    }

    this.dispatch(transaction);
  }

  getMarkPos() {
    const pos = this.view.posAtDOM(this.dom);
    const resolvedPos = this.view.state.doc.resolve(pos);
    const range = getMarkRange(resolvedPos, this.node.type);
    return range;
  }

  // disable (almost) all prosemirror event listener for node views
  // stopEvent(event) {
  //   if (!this.dom) {
  //     return false;
  //   }
  //   if (typeof this.extension.stopEvent === 'function') {
  //     return this.extension.stopEvent(event);
  //   }
  //
  //   const draggable = !!this.extension.schema.draggable;
  //
  //   // support a custom drag handle
  //   if (draggable && event.type === 'mousedown') {
  //     const dragHandle = event.target.closest &&
  //       event.target.closest('[data-drag-handle]');
  //     const isValidDragHandle = dragHandle &&
  //       (this.dom === dragHandle || this.dom.contains(dragHandle));
  //
  //     if (isValidDragHandle) {
  //       this.captureEvents = false;
  //       document.addEventListener('dragend', () => {
  //         this.captureEvents = true;
  //       }, { once: true });
  //     }
  //   }
  //
  //   const isCopy = event.type === 'copy';
  //   const isPaste = event.type === 'paste';
  //   const isCut = event.type === 'cut';
  //   const isDrag = event.type.startsWith('drag') || event.type === 'drop';
  //
  //   if ((draggable && isDrag) || isCopy || isPaste || isCut) {
  //     return false;
  //   }
  //
  //   return this.captureEvents;
  // }

  onDragStart(event) {
    const { view } = this.editor;
    const target = event.target;

    // get the drag handle element
    // `closest` is not available for text nodes so we may have to use its parent
    const dragHandle = target.nodeType === 3 ?
      target.parentElement?.closest('[data-drag-handle]') :
      target.closest('[data-drag-handle]');

    if (
      !this.dom ||
      this.contentDOM?.contains(target) ||
      !dragHandle
    ) {
      return;
    }

    let x = 0;
    let y = 0;

    // calculate offset for drag element if we use a different drag handle element
    if (this.dom !== dragHandle) {
      const domBox = this.dom.getBoundingClientRect();
      const handleBox = dragHandle.getBoundingClientRect();

      x = handleBox.x - domBox.x + event.offsetX;
      y = handleBox.y - domBox.y + event.offsetY;
    }

    event.dataTransfer?.setDragImage(this.dom, x, y);

    // we need to tell ProseMirror that we want to move the whole node
    // so we create a NodeSelection
    const selection = NodeSelection.create(view.state.doc, this.getPos());
    const transaction = view.state.tr.setSelection(selection);

    view.dispatch(transaction);
  }

  ignoreMutation(mutation) {
    if (!this.dom || !this.contentDOM) {
      return true;
    }

    // a leaf/atom node is like a black box for ProseMirror
    // and should be fully handled by the node view
    if (this.node.isLeaf) {
      return true;
    }

    // ProseMirror should handle any selections
    if (mutation.type === 'selection') {
      return false;
    }

    // try to prevent a bug on iOS that will break node views on enter
    // this is because ProseMirror can’t preventDispatch on enter
    // this will lead to a re-render of the node view on enter
    // see: https://github.com/ueberdosis/tiptap/issues/1214
    if (this.dom.contains(mutation.target) && mutation.type === 'childList' && isiOS()) {
      const changedNodes = [
        ...Array.from(mutation.addedNodes),
        ...Array.from(mutation.removedNodes)
      ];

      // we’ll check if every changed node is contentEditable
      // to make sure it’s probably mutated by ProseMirror
      if (changedNodes.every(node => node.isContentEditable)) {
        return false;
      }
    }

    // we will allow mutation contentDOM with attributes
    // so we can for example adding classes within our node view
    if (this.contentDOM === mutation.target && mutation.type === 'attributes') {
      return true;
    }

    // ProseMirror should handle any changes within contentDOM
    if (this.contentDOM.contains(mutation.target)) {
      return false;
    }

    return true;
  }

  deleteNode() {
    const from = this.getPos();
    const to = from + this.node.nodeSize;

    this.editor.commands.deleteRange({ from, to });
  }

  destroy() {
    this.isDestroyed = true;
  }
}

export function nodeViewRenderer(Component = null, buildComponent = null) {
  if (buildComponent) { return buildComponent; }
  if (Component) { return props => new Component(null, props); }

  return null;
}
