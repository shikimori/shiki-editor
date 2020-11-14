import { Slice, Fragment } from 'prosemirror-model';
import insertSlice from './insert_slice';
import { htmlToNodes, findCutBefore } from '../utils';

export default function insertQuote(quote, editor) {
  return (state, dispatch) => {
    const fragment = htmlToNodes(editor, quote.html);

    const { blockquote, paragraph } = state.schema.nodes;

    const quoteNode = blockquote.create({
      [`${quote.type}_id`]: quote.id,
      userId: quote.userId,
      nickname: quote.nickname
    }, fragment);

    const $cut = findCutBefore(state.selection.$cursor);
    const nodes = [quoteNode, paragraph.create()];

    if ($cut?.nodeBefore?.type === blockquote) {
      nodes.unshift(paragraph.create());
    }

    const slice = new Slice(Fragment.from(nodes), 0, 0);

    insertSlice(slice)(state, dispatch);
  };
}
