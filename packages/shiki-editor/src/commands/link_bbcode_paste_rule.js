// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-commands/src/commands/pasteRule.js
import { Plugin } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';

const URL_REGEXP = /(\[url(?:=([^\]]+))?\])([^\]]+)(\[\/url\])/;

export default function linkBbcodePasteRule(type) {
  const handler = fragment => {
    const nodes = [];

    fragment.forEach(child => {
      if (child.isText) {
        const { text } = child;
        let pos = 0;
        let match;

        do {
          const matchedText = text.slice(pos);
          match = URL_REGEXP.exec(matchedText);

          if (match) {
            const start = pos + match.index;
            const end = start + match[0].length;
            const [, openBbcode, urlOrNothing, textOrUrl, closeBbCode] = match;

            if (start > 0) {
              nodes.push(child.cut(pos, start));
            }

            nodes.push(
              child
                .cut(start + openBbcode.length, end - closeBbCode.length)
                .mark(
                  type
                    .create({ url: urlOrNothing || textOrUrl })
                    .addToSet(child.marks)
                )
            );
            pos = end;
          }
        } while (match);

        if (pos < text.length) {
          nodes.push(child.cut(pos));
        }
      } else {
        nodes.push(child.copy(handler(child.content)));
      }
    });

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    props: {
      transformPasted: slice => new Slice(handler(slice.content), slice.openStart, slice.openEnd)
    }
  });
}
