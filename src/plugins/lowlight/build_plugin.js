import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { findChildren } from 'prosemirror-utils/src/node';

export default function buildLowlightPlugin(nodeName, lowlight) {
  return new Plugin({
    key: new PluginKey('lowlight'),
    state: {
      init: (_, { doc }) => getDecorations(doc, nodeName, lowlight),
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.parent.type.name;
        const newNodeName = newState.selection.$head.parent.type.name;
        const oldNodes =
          findChildren(oldState.doc, node => node.type.name === nodeName);
        const newNodes =
          findChildren(newState.doc, node => node.type.name === nodeName);
        const isApply = isApplyDecoration(
          nodeName,
          transaction,
          oldNodeName,
          newNodeName,
          oldNodes,
          newNodes
        );

        if (isApply) {
          return getDecorations(transaction.doc, nodeName, lowlight);
        }

        return decorationSet.map(transaction.mapping, transaction.doc);
      }
    },
    props: {
      decorations(state) {
        return this.getState(state);
      }
    }
  });
}

function parseNodes(nodes, className = []) {
  return nodes
    .map(node => {
      const classes = [
        ...className,
        ...node.properties ?
          node.properties.className :
          []
      ];
      if (node.children) {
        return parseNodes(node.children, classes);
      }
      return {
        text: node.value,
        classes
      };
    })
    .flat();
}

function getDecorations(doc, nodeName, lowlight) {
  const decorations = [];

  findChildren(doc, node => node.type.name === nodeName)
    .forEach(block => {
      let from = block.pos + 1;

      const { language } = block.node.attrs;
      const languages = lowlight.listLanguages();
      if (!language && languages.includes(language)) { return; }

      const nodes = language && languages.includes(language) ?
        lowlight.highlight(language, block.node.textContent).children :
        [];

      parseNodes(nodes).forEach(node => {
        const to = from + node.text.length;
        if (node.classes.length) {
          const decoration = Decoration.inline(from, to, {
            class: node.classes.join(' ')
          });
          decorations.push(decoration);
        }
        from = to;
      });
    });

  return DecorationSet.create(doc, decorations);
}

function isApplyDecoration(
  nodeName,
  transaction,
  oldNodeName,
  newNodeName,
  oldNodes,
  newNodes
) {
  return transaction.docChanged &&
    // Apply decorations if:
    (
      // selection includes named node,
      [oldNodeName, newNodeName].includes(nodeName) ||
      // OR transaction adds/removes named node,
      newNodes.length !== oldNodes.length ||
      // OR transaction has changes that completely encapsulte a node
      // (for example, a transaction that affects the entire document).
      // Such transactions can happen during collab syncing via y-prosemirror, for example.
      transaction.steps.some(step =>
        // @ts-ignore
        step.from !== undefined &&
          // @ts-ignore
          step.to !== undefined &&
          oldNodes.some(node =>
            // @ts-ignore
            node.pos >= step.from &&
              // @ts-ignore
              node.pos + node.node.nodeSize <= step.to
          )
      )
    );
}
