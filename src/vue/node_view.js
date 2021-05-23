// https://github.com/ueberdosis/tiptap/blob/main/packages/vue-3/src/VueNodeViewRenderer.ts
import {
  ref,
  provide,
  defineComponent
} from 'vue';
import NodeView from '../node_view';
import VueRenderer from './renderer';

export default class VueNodeView extends NodeView {
  // renderer = null
  // decorationClasses = null

  mount() {
    const props = {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations,
      isSelected: false,
      extension: this.extension,
      getPos: () => this.getPos(),
      updateAttributes: attrs => this.updateAttributes(attrs),
      deleteNode: () => this.deleteNode()
    };

    const onDragStart = this.onDragStart.bind(this);

    this.decorationClasses = ref(this.getDecorationClasses());

    const extendedComponent = defineComponent({
      extends: { ...this.component },
      props: Object.keys(props),
      setup: () => {
        provide('onDragStart', onDragStart);
        provide('decorationClasses', this.decorationClasses);

        return this.component.setup?.(props);
      }
    });

    this.renderer = new VueRenderer(extendedComponent, {
      editor: this.editor,
      props
    });
  }


  get dom() {
    if (!this.renderer.element.hasAttribute('data-node-view-wrapper')) {
      throw Error('Please use the NodeViewWrapper component for your node view.');
    }

    return this.renderer.element;
  }

  get contentDOM() {
    if (this.node.isLeaf) {
      return null;
    }

    const contentElement = this.dom.querySelector('[data-node-view-content]');

    return contentElement || this.dom;
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
    this.decorationClasses.value = this.getDecorationClasses();
    this.renderer.updateProps({ node, decorations });

    return true;
  }

  selectNode() {
    this.renderer.updateProps({
      isSelected: true
    });
  }

  deselectNode() {
    this.renderer.updateProps({
      isSelected: false
    });
  }

  getDecorationClasses() {
    return this.decorations
      .map(item => item.type.attrs.class)
      .flat()
      .join(' ');
  }

  destroy() {
    this.renderer.destroy();
  }
}

VueNodeView.buildRenderer = function(component) {
  return (props) => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!props.editor.contentComponent) {
      return {};
    }

    return new VueNodeView(component, props);
  };
};
