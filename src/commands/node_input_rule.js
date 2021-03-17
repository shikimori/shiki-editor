import { InputRule } from 'prosemirror-inputrules';

export default function(regexp, type, getAttrs) {
  return new InputRule(regexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    const { tr } = state;

    if (match[0]) {
      const isCode = state.selection.$head.nodeBefore?.marks?.some(mark => (
        mark.type.spec.code
      ));
      if (isCode) { return false; }

      tr.replaceWith(start - 1, end, type.create(attrs));
    }

    return tr;
  });
}
