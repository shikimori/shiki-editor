import { Plugin, PluginKey } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';

export default new Plugin({
  key: new PluginKey('prevent_transform_pasted_inside_code_mark'),
  props: {
    // when pasted into node with code mark, create new slice of text with
    // code mark so in transformPasted this slice could be ignored
    clipboardTextParser: (text, $context, _plainText) => {
      const node = $context.nodeBefore || $context.nodeAfter;

      if (!node || !node.isText) { return; }
      if (!node.marks.some(mark => mark.type.spec.code)) { return; }

      const fragment = Fragment.from(node.type.schema.text(text, node.marks));
      return new Slice(fragment, 0, 0);
    }
  }
});
