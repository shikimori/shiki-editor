// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-commands/src/commands/markPasteRule.js
import { Plugin } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';

export default function(regexp, type, getAttrs) {
  const handler = (fragment, parent) => {
    const nodes = [];

    fragment.forEach(child => {
      if (child.isText) {
        const { text, marks } = child;
        let pos = 0;
        let match;

        const isLinkInline = !!marks.filter(x => x.type.name === 'link_inline')[0];

        // eslint-disable-next-line
        while (!isLinkInline && (match = regexp.exec(text)) !== null) {
          if (parent.type.allowsMarkType(type) && match[1]) {
            const start = match.index;
            const end = start + match[0].length;
            const textStart = start + match[0].indexOf(match[1]);
            const textEnd = textStart + match[1].length;
            const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;

            // adding text before markdown to nodes
            if (start > 0) {
              nodes.push(child.cut(pos, start));
            }

            // adding the markdown part to nodes
            nodes.push(child
              .cut(textStart, textEnd)
              .mark(type.create(attrs)
                .addToSet(child.marks)));

            pos = end;
          }
        }

        // adding rest of text to nodes
        if (pos < text.length) {
          nodes.push(child.cut(pos));
        }
      } else {
        nodes.push(child.copy(handler(child.content, child)));
      }
    });

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    props: {
      transformPasted: slice => {
        const node = slice.content.content[0];
        // prevent transformation of pasted nodes containing code mark
        if (node?.marks?.some(mark => mark.type.spec.code)) {
          return slice;
        }

        const parsedFragment = handler(slice.content);
        return new Slice(parsedFragment, slice.openStart, slice.openEnd);
      }
    }
  });
}
