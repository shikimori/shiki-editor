import { Plugin } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';
import { isContainsCodeMark } from '../utils';

export default function pasteRule(regexp, type, getAttrs) {
  const handler = fragment => {
    const nodes = [];

    fragment.forEach(child => {
      if (child.type.spec.code || isContainsCodeMark(child)) {
        nodes.push(child);
      } else if (child.isText) {
        const { text } = child;
        let pos = 0;
        let match;

        do {
          const matchedText = text.slice(pos);

          match = regexp.exec(matchedText);
          if (match) {
            const start = pos + match.index;
            const end = start + match[0].length;
            const attrs = getAttrs instanceof Function ?
              getAttrs(match) :
              getAttrs;

            if (start > pos) {
              nodes.push(child.cut(pos, start));
            }

            nodes.push(type.create(attrs));
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
      transformPasted: slice => (
        new Slice(handler(slice.content), slice.openStart, slice.openEnd)
      )
    }
  });
}
