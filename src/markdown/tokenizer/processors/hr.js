import Token from '../token';

export default function processHr(state, bbcode) {
  state.ensureParagraphClosed();
  state.next(bbcode.length, true);
  state.push(new Token('hr', null, null, null));
}
