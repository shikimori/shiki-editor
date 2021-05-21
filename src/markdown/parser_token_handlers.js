/* eslint-disable */
// https://github.com/ProseMirror/prosemirror-markdown/blob/v1/src/from_markdown.js

export default function tokenHandlers(schema, tokens) {
  const handlers = Object.create(null);

  for (const type in tokens) {
    const spec = tokens[type];

    if (spec.block) {
      const nodeType = schema.nodeType(spec.block);
      if (noOpenClose(type)) {
        handlers[type] = (state, token) => {
          state.openNode(nodeType, attrs(spec, token));
          state.addText(withoutTrailingNewline(token.content));
          state.closeNode();
        };
      } else {
        handlers[type + '_open'] = (state, token) => state.openNode(nodeType, attrs(spec, token));
        handlers[type + '_close'] = state => state.closeNode();
      }

    } else if (spec.node) {
      const nodeType = schema.nodeType(spec.node);
      handlers[type] = (state, token) => state.addNode(nodeType, attrs(spec, token));

    } else if (spec.contentNode) {
      const nodeType = schema.nodeType(spec.contentNode);
      handlers[type] = (state, token) => {
        if (token.children?.length) {
          state.openNode(nodeType, attrs(spec, token));
          if (token.children) {
            state.parseTokens(token.children)
          }
          // do not class close because it resets marks
          // state.closeNode();
          const info = state.stack.pop();
          return state.addNode(info.type, info.attrs, info.content);
        } else {
          state.addNode(nodeType, attrs(spec, token))
        }
      }

    } else if (spec.mark) {
      const markType = schema.marks[spec.mark];
      if (noOpenClose(type)) {
        handlers[type] = (state, token) => {
          state.openMark(markType.create(attrs(spec, token)));
          state.addText(withoutTrailingNewline(token.content));
          state.closeMark(markType);
        };
      } else {
        handlers[type + '_open'] = (state, token) => (
          state.openMark(markType.create(attrs(spec, token)))
        );
        handlers[type + '_close'] = state => state.closeMark(markType);
      }

    } else if (spec.ignore) {
      if (noOpenClose(type)) {
        handlers[type] = noOp;
      } else {
        handlers[type + '_open'] = noOp;
        handlers[type + '_close'] = noOp;
      }

    } else {
      throw new RangeError('Unrecognized parsing spec ' + JSON.stringify(spec));
    }
  }

  handlers.text = (state, token) => state.addText(token.content);
  handlers.inline = (state, token) => state.parseTokens(token.children);
  handlers.softbreak = handlers.softbreak || (state => state.addText('\n'));

  return handlers;
}

function attrs(spec, token) {
  if (spec.getAttrs) return spec.getAttrs(token);
  // For backwards compatibility when `attrs` is a Function
  if (spec.attrs instanceof Function) return spec.attrs(token);
  return spec.attrs;
}

// Code content is represented as a single token with a `content`
// property in Markdown-it.
function noOpenClose(type) {
  return type == 'code_inline' ||
    type == 'code_block' ||
    type == 'fence';
}

function withoutTrailingNewline(str) {
  return str[str.length - 1] == '\n' ? str.slice(0, str.length - 1) : str;
}

function noOp() {}
