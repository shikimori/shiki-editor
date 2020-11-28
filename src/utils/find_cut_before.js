export default function findCutBefore($pos) {
  if (!$pos.parent.type.spec.isolating) {
    for (let i = $pos.depth - 1; i >= 0; i--) {
      if ($pos.index(i) > 0) { return $pos.doc.resolve($pos.before(i + 1)); }
      if ($pos.node(i).type.spec.isolating) { break; }
    }
  }
  return null;
}
