import { Fragment } from 'prosemirror-model';

// Create a matcher that matches when a specific character is typed
export default function detectSequence($position, { startChar, allowedSpaces }) {
  // cancel if top level node
  if ($position.depth <= 0) { return false; }
  // cancel if missing nodeBefore
  if (!$position.nodeBefore) { return false; }
  // cancel if inside code or contains preventSuggestion mark
  if (isForbiddenSpec($position.parent)) { return false; }
  if (isForbiddenSpec($position.nodeBefore)) { return false; }

  const leftText =
    extractBeforeText($position.nodeBefore, startChar, allowedSpaces);
  if (!leftText) { return null; }

  let rightText = isForbiddenSpec($position.nodeAfter) ?
    '' :
    extractAfterText($position.nodeAfter, 0);

  const text = leftText + rightText;

  return {
    range: {
      from: $position.pos - leftText.length,
      to: $position.pos + rightText.length
    },
    query: text.slice(startChar.length),
    text: text,
    isCursorAtEnd: !rightText.length
  };
}

function extractBeforeText(node, startChar, allowedSpaces) {
  const nodeText = node.text;
  if (!nodeText) { return null; }

  let spacesLeft = allowedSpaces;
  let text;

  for (let i = nodeText.length - 1; i >= 0; i -= 1) {
    const char = nodeText[i];

    if (char === ' ') {
      if (spacesLeft) {
        spacesLeft -= 1;
        continue;
      } else {
        break;
      }
    }

    if (char === startChar) {
      text = nodeText.slice(i);
      break;
    }
  }

  return text;
}

function extractAfterText(node) {
  const nodeText = node?.text;
  if (!nodeText || nodeText[0] === ' ') { return ''; }

  let i = 1;

  for (; i <= nodeText.length; i += 1) {
    const char = nodeText[i];

    if (char === ' ') {
      break;
    }
  }

  return nodeText.slice(0, i);
}

function isForbiddenSpec(node) {
  return !node || node.type.spec.code || node.marks.some(mark => (
    mark.type.spec.code || mark.type.spec.preventSuggestion
  ));
}

// https://github.com/ProseMirror/prosemirror-model/blob/v1/src/fragment.js#L44
Fragment.prototype._suggestionTextBetween =
  function(from, to, blockSeparator, leafText) {
    let text = '';
    let separated = true;

    this.nodesBetween(from, to, (node, pos) => {
      if (node.marks.some(mark => mark.type.spec.preventSuggestion)) {
        return false;
      }

      if (node.isText) {
        text += node.text.slice(Math.max(from, pos) - pos, to - pos);
        separated = !blockSeparator;
      } else if (node.isLeaf && leafText) {
        text += leafText;
        separated = !blockSeparator;
      } else if (!separated && node.isBlock) {
        text += blockSeparator;
        separated = true;
      }
    }, 0);

    return text;
  };
