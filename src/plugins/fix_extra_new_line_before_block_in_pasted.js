import { Plugin, PluginKey } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';

const BLOCK_TYPES = [
  'bullet_list',
  'blockquote',
  'quote',
  'spoiler_block',
  'div'
];

export default function fixExtraNewLineBeforeBlockInPasted() {
  return new Plugin({
    key: new PluginKey('fix_extra_new_line_before_block_in_pasted'),
    props: {
      transformPasted(slice) {
        return new Slice(
          remadeFragmentWoExtraNewLinesBeforeBlock(slice.content),
          slice.openStart,
          slice.openEnd
        );
      }
    }
  });
}

function remadeFragmentWoExtraNewLinesBeforeBlock(fragment) {
  const nodes = [];

  fragment.forEach((child, _size, index) => {
    const nextChild = fragment.content[index + 1];
    let newChild = child;

    if (isParagraphEndedWithHardBreak(child) && isChildOfBlockType(nextChild)) {
      // cut HardBreak
      newChild = child.type.create(
        child.attrs,
        child.content.content.slice(0, child.content.content.length - 1),
        child.marks
      );
    } else if (isChildOfBlockType(child)) {
      // recursive remadeFragmentWoExtraNewLinesBeforeBlock in inner nodes
      newChild = child.type.create(
        child.attrs,
        remadeFragmentWoExtraNewLinesBeforeBlock(child.content),
        child.marks
      );
    }

    nodes.push(newChild);
  });

  return Fragment.fromArray(nodes);
}

function isParagraphEndedWithHardBreak(child) {
  return child.type.name === 'paragraph' &&
    child.childCount &&
    child.content.lastChild.type.name === 'hard_break';
}

function isChildOfBlockType(child) {
  return BLOCK_TYPES.includes(child.type.name);
}
