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

  return $sequence => {
    // cancel if top level node
    if ($sequence.depth <= 0) { return false; }
    // cancel if inside code
    if ($sequence.parent.type.spec.code ||
      isContainsCodeMark($sequence.nodeBefore || $sequence.nodeAfter)
    ) { return false; }

    // Lookup the boundaries of the current node
    const textFrom = $sequence.before();
    const textTo = $sequence.end();
    const text = $sequence.doc.content
      ._suggestionTextBetween(textFrom, textTo, '\0', '\0');

    // let match = text.endsWith('  ') || text.split(' ').length > 3 ?
    //   null :
    //   regexp.exec(text);

    let match = regexp.exec(text);
    let sequence;

    while (match !== null) {
      // JavaScript doesn't have lookbehinds; this hacks a check that first character is " "
      // or the line beginning
      const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);

      if (MATCH_PREFIX_REGEXP.test(matchPrefix)) {
        // The absolute sequence of the match in the document
        const from = match.index + $sequence.start();
        let to = from + match[0].length;

        // Edge case handling; if spaces are allowed and we're directly in between
        // two triggers
        if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
          match[0] += ' ';
          to += 1;
        }

        // If the $sequence is located within the matched substring, return that range
        if (from < $sequence.pos && to >= $sequence.pos) {
          sequence = {
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

    return sequence;
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
