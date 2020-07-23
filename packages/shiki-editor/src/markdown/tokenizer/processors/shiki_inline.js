import Token from '../token';
import { extractUntil } from '../helpers';

export const SHIKI_LINK_REGEXP =
  /\[(anime|manga|ranobe|character|person)=(\d+)\]/;
export const SHIKI_IMAGE_REGEXP = /\[(poster|image)=(\d+)(?: ([^\]]+))?\]/;

export function processShikiInline(
  state,
  startSequence,
  endSequence,
  meta
) {
  let text;
  if (endSequence) {
    text = extractUntil(
      state.text,
      endSequence,
      state.index + startSequence.length
    );
  }

  if (text) {
    const sequence = `${startSequence}${text}${endSequence}`;
    state.inlineTokens.push(
      new Token(
        'shiki_inline',
        null,
        null,
        {
          ...meta,
          text,
          bbcode: sequence
        }
      )
    );
    state.next(sequence.length);
  } else {
    state.inlineTokens.push(
      new Token(
        'shiki_inline', null, null, { ...meta }
      )
    );
    state.next(startSequence.length);
  }
  return true;
}
