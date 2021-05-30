// https://github.com/ueberdosis/tiptap/blob/main/packages/core/src/pasteRules/markPasteRule.ts
import { Plugin, PluginKey } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';

export default function markPasteRule(regexp, type, getAttributes) {
  const handler = (fragment, parent) => {
    const nodes = [];

    fragment.forEach(child => {
      if (child.isText && child.text) {
        const { text, marks } = child;
        let pos = 0;
        let match;

        const isLinkInline = !!marks.filter(x => x.type.name === 'link_inline')[0];

        // eslint-disable-next-line
        while (!isLinkInline && (match = regexp.exec(text)) !== null) {
          const outerMatch = Math.max(match.length - 2, 0);
          const innerMatch = Math.max(match.length - 1, 0);

          if (parent === null || parent === void 0 ? void 0 : parent.type.allowsMarkType(type)) {
            const start = match.index;
            const matchStart = start + match[0].indexOf(match[outerMatch]);
            const matchEnd = matchStart + match[outerMatch].length;
            const textStart = matchStart +
              match[outerMatch].lastIndexOf(match[innerMatch]);
            const textEnd = textStart + match[innerMatch].length;
            const attrs = getAttributes instanceof Function ?
              getAttributes(match) :
              getAttributes;

            // adding text before markdown to nodes
            if (matchStart > 0) {
              nodes.push(child.cut(pos, matchStart));
            }

            // adding the markdown part to nodes
            nodes.push(child
              .cut(textStart, textEnd)
              .mark(type.create(attrs).addToSet(child.marks)));

            pos = matchEnd;
          }
        }

        // adding rest of text to nodes
        if (pos < text.length) {
          nodes.push(child.cut(pos));
        }
      }
      else {
        nodes.push(child.copy(handler(child.content, child)));
      }
    });

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    key: new PluginKey('mark_paste_rule'),
    props: {
      transformPasted: slice => {
        const node = slice.content.content[0];
        // prevent transformation of pasted nodes containing code mark
        if (node?.marks?.some(mark => mark.type.spec.code)) {
          return slice;
        }

        return new Slice(handler(slice.content), slice.openStart, slice.openEnd);
      }
    }
  });
}
