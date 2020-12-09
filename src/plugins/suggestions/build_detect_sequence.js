import { isContainsCodeMark } from '../../utils';
import { Fragment } from 'prosemirror-model';

// Create a matcher that matches when a specific character is typed
export default function buildDetectSequence({
  char,
  allowSpaces,
  startOfLine
}) {
  // Matching expressions used for later
  const escapedChar = `\\${char}`;
  const suffix = new RegExp(`\\s${escapedChar}$`);
  const prefix = startOfLine ? '^' : '';
  const regexp = allowSpaces ?
    new RegExp(`${prefix}${escapedChar}.*?(?=\\s${escapedChar}|$)`, 'gm') :
    new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, 'gm');

  const MATCH_PREFIX_REGEXP = /^[\s\0]?$/;

  return $position => {
    // cancel if top level node
    if ($position.depth <= 0) { return false; }
    // cancel if inside code
    if ($position.parent.type.spec.code ||
      isContainsCodeMark($position.nodeBefore || $position.nodeAfter)
    ) { return false; }

    // Lookup the boundaries of the current node
    const textFrom = $position.before();
    const textTo = $position.end();
    const text = $position.doc.content
      ._suggestionTextBetween(textFrom, textTo, '\0', '\0');

    // let match = text.endsWith('  ') || text.split(' ').length > 3 ?
    //   null :
    //   regexp.exec(text);

    let match = regexp.exec(text);
    let position;

    while (match !== null) {
      // JavaScript doesn't have lookbehinds; this hacks a check that first character is " "
      // or the line beginning
      const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);

      if (MATCH_PREFIX_REGEXP.test(matchPrefix)) {
        // The absolute position of the match in the document
        const from = match.index + $position.start();
        let to = from + match[0].length;

        // Edge case handling; if spaces are allowed and we're directly in between
        // two triggers
        if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
          match[0] += ' ';
          to += 1;
        }

        // If the $position is located within the matched substring, return that range
        if (from < $position.pos && to >= $position.pos) {
          position = {
            range: {
              from,
              to
            },
            query: match[0].slice(char.length),
            text: match[0]
          };
        }
      }

      match = regexp.exec(text);
    }

    return position;
  };
}

// based on https://github.com/ProseMirror/prosemirror-model/blob/master/src/fragment.js#L44
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
