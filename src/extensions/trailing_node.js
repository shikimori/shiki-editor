// https://github.com/scrumpy/tiptap/blob/v1/packages/tiptap-extensions/src/extensions/TrailingNode.js
import { Plugin, PluginKey } from 'prosemirror-state';
import { Extension } from '../base';

export default class TrailingNode extends Extension {
  get name() {
    return 'trailing_node';
  }

  get defaultOptions() {
    return {
      nodeName: 'paragraph',
      ignoredNodes: [
        'paragraph'
      ]
    };
  }

  get plugins() {
    const trailingNodePluginKey = new PluginKey(this.name);
    const { nodeName, ignoredNodes } = this.options;
    const types = Object.values(this.editor.schema.nodes)
      .map((node) => node)
      .filter((node) => !ignoredNodes.includes(node.name));

    return [
      new Plugin({
        key: trailingNodePluginKey,
        appendTransaction(_, __, state) {
          const type = state.schema.nodes[nodeName];
          const { doc, tr } = state;
          const shouldInsertNodeAtEnd = trailingNodePluginKey.getState(state);
          const endPosition = doc.content.size;

          if (!shouldInsertNodeAtEnd) {
            return;
          }

          return tr
            .insert(endPosition, type.create())
            .setMeta('addToHistory', false);
        },
        state: {
          init: (_, { doc, schema }) => {
            const nodeType = schema.nodes[nodeName];

            if (!nodeType) {
              throw new Error(`Invalid node being used for trailing node extension: '${nodeName}'`);
            }

            return types.includes(doc.lastChild?.type);
          },
          apply: (tr, value) => {
            if (!tr.docChanged) {
              return value;
            }

            return types.includes(tr.doc.lastChild?.type);
          }
        }
      })
    ];
  }
}
