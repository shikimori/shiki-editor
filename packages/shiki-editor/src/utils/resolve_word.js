export default function resolveWord($pos) {
  const { pos, nodeBefore, nodeAfter } = $pos;
  const textBefore = nodeBefore?.text;
  const textAfter = nodeAfter?.text;

  const isSpaceAfter = nodeAfter && textAfter[0] === ' ';

  if (isSpaceAfter || !nodeAfter) {
    return;
  }

  const fromIndex = textBefore?.lastIndexOf(' ');
  const from = nodeBefore ?
    pos - (fromIndex === -1 ? textBefore.length : textBefore.length - fromIndex) :
    pos;

  const toIndex = nodeAfter ? textAfter.indexOf(' ') : pos;
  const to = pos + (toIndex === -1 ? textAfter.length : toIndex);

  return { from, to };
}
