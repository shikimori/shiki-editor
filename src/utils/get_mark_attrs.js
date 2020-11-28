// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-utils/src/utils/getMarkAttrs.js
export default function getMarkAttrs(type, state) {
  const { from, to } = state.selection;
  let marks = [];

  state.doc.nodesBetween(from, to, node => {
    marks = [...marks, ...node.marks];
  });

  const mark = marks.find(markItem => markItem.type.name === type.name);

  if (mark) {
    return mark.attrs;
  }

  return {};
}
