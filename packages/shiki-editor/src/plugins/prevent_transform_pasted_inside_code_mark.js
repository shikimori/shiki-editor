import { Plugin, PluginKey } from 'prosemirror-state';
import { Slice, Fragment, DOMParser } from 'prosemirror-model';
import { isContainsCodeMark } from '../utils';

export default function preventTransformPastedInsideCodeMark(editor) {
  return new Plugin({
    key: new PluginKey('prevent_transform_pasted_inside_code_mark'),
    props: {
      // when pasted `text` into node with code mark,
      // create new slice of text with code mark,
      // so in transformPasted this slice could be ignored
      clipboardTextParser: (text, $context, _plainText) => {
        const node = $context.nodeBefore || $context.nodeAfter;

        return isContainsCodeMark(node) ?
          textCodeMarkedSlice(node, editor.schema, text) :
          null;
      },
      // when pasted `html` into node with code mark,
      // create new slice of text with code mark,
      // otherwise parse content as regular html similar to prosemirror does in
      // https://github.com/ProseMirror/prosemirror-view/blob/master/src/clipboard.js#L38
      clipboardParser: {
        parseSlice(dom, { context, preserveWhitespace }) {
          const node = context.nodeBefore || context.nodeAfter;

          return isContainsCodeMark(node) ?
            textCodeMarkedSlice(node, editor.schema, dom.innerText) :
            DOMParser
              .fromSchema(editor.schema)
              .parseSlice(dom, { context, preserveWhitespace });
        }
      }
    }
  });
}

function textCodeMarkedSlice(node, schema, text) {
  const fragment = Fragment.from(schema.text(text, node.marks));
  return new Slice(fragment, 0, 0);
}
