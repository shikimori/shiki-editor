// https://github.com/scrumpy/tiptap/blob/v1/packages/tiptap/src/Nodes/Paragraph.js
// import { setBlockType } from 'prosemirror-commands';
import { Node } from '../base';
// import { Plugin, PluginKey } from 'prosemirror-state';

const OMIT_LAST_NEWLINE_INSIDE_NODES = ['list_item', 'blockquote'];

export default class Paragraph extends Node {
  get name() {
    return 'paragraph';
  }

  get schema() {
    return {
      attrs: {
        isHardBreak: { default: false }
      },
      content: 'inline*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'p',
        getAttrs: node => ({
          isHardBreak: node.getAttribute('data-hard-break') != undefined
        })
      }],
      toDOM: node => [
        'p',
        node.attrs.isHardBreak ? { 'data-hard-break': '' } : {},
        0
      ]
    };
  }

  // commands({ type }) {
  //   return () => setBlockType(type);
  // }

  // hack to prevent copying isHardBreak attribute on split
  // get plugins() {
  //   return new Plugin({
  //      appendTransaction(_, __, state) {
  //       let documentIds = {};
  //       let transaction;
  //       // Check for duplicated anchor IDs
  //       state.doc.descendants((node, pos) => {
  //           var _a;
  //           if (anchorNodeName.includes(node.type.name) && ((_a = node.attrs) === null || _a === void 0 ? void 0 : _a.id)) {
  //               let anchorId = node.attrs.id;
  //               // Replace or delete if
  //               if (documentIds[anchorId]) {
  //                   if (!transaction) {
  //                       transaction = state.tr;
  //                   }
  //                   anchorId = nanoid();
  //                   transaction.setNodeMarkup(pos, node.type, assign({}, node.attrs, {
  //                       id: anchorId // new id for header
  //                   }));
  //               }
  //               documentIds[anchorId] = true;
  //           }
  //       });
  //       return transaction;
  //     }
  //   });
  // }

  markdownSerialize(state, node, parent) {
    if (node.content.content.length) {
      state.renderInline(node);

      if (node.attrs.isHardBreak) {
        state.write('[br]');
        state.closeBlock(null);
      } else {
        state.closeBlock(node);
      }

    } else {
      if (!state.atBlank()) {
        state.closeBlock(node);
      }

      if (OMIT_LAST_NEWLINE_INSIDE_NODES.includes(parent.type.name) &&
        parent.lastChild === node
      ) {
        return;
      }

      state.write(node.attrs.isHardBreak ? '[br]' : '\n');
    }
  }
}
