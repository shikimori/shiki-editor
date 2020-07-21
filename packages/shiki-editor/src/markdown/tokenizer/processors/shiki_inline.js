import Token from '../token';

export default function(state, bbcode, meta) {
  state.inlineTokens.push(
    new Token(
      'shiki_inline', null, null, { ...meta, bbcode }
    )
  );
  state.next(bbcode.length);
  return true;
}
