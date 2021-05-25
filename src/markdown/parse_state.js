/* eslint-disable */
// https://github.com/ProseMirror/prosemirror-markdown/blob/v1/src/from_markdown.js

import { Mark } from 'prosemirror-model';

function maybeMerge(a, b) {
  if (a.isText && b.isText && Mark.sameSet(a.marks, b.marks)) return a.withText(a.text + b.text);
}

// Object used to track the context of a running parse.
export default class MarkdownParseState {
  constructor(schema, tokenHandlers) {
    this.schema = schema;
    this.stack = [{ type: schema.topNodeType, content: [] }];
    this.marks = Mark.none;
    this.tokenHandlers = tokenHandlers;
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  push(elt) {
    if (this.stack.length) this.top().content.push(elt);
  }

  // : (string)
  // Adds the given text to the current position in the document,
  // using the current marks as styling.
  addText(text) {
    if (!text) return;
    const nodes = this.top().content;
    const last = nodes[nodes.length - 1];
    const node = this.schema.text(text, this.marks);
    let merged;

    if (last && (merged = maybeMerge(last, node))) {
      nodes[nodes.length - 1] = merged;
    } else {
      nodes.push(node);
    }
  }

  // : (Mark)
  // Adds the given mark to the set of active marks.
  openMark(mark) {
    this.marks = mark.addToSet(this.marks);
  }

  // : (Mark)
  // Removes the given mark from the set of active marks.
  closeMark(mark) {
    this.marks = mark.removeFromSet(this.marks);
  }

  parseTokens(tokens) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const handler = this.tokenHandlers[
        token.direction ? `${token.type}_${token.direction}` : token.type
      ];
      if (!handler) {
        throw new Error(
          'Token type `' + token.type + '` not supported by Markdown parser'
        );
      }

      handler(this, token);
    }
  }

  // : (NodeType, ?Object, ?[Node]) → ?Node
  // Add a node at the current position.
  addNode(type, attrs, content) {
    const node = type.createAndFill(attrs, content, this.marks);
    if (!node) { return null; }

    this.push(node);
    return node;
  }

  // : (NodeType, ?Object)
  // Wrap subsequent content in a node of the given type.
  openNode(type, attrs) {
    this.stack.push({ type, attrs, content: [] });
  }

  // : () → ?Node
  // Close and return the node that is currently on top of the stack.
  closeNode() {
    if (this.marks.length) {
      this.marks = Mark.none;
    }
    const info = this.stack.pop();
    return this.addNode(info.type, info.attrs, info.content);
  }
}
