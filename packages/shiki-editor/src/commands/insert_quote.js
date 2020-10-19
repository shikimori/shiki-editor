import { Slice, Fragment } from 'prosemirror-model';
import insertSlice from './insert_slice';
import { htmlToNodes } from '../utils';

export default function insertQuote(quote, editor) {
  return (state, dispatch) => {
    const fragment = htmlToNodes(editor, quote.html);

    const quoteNode = state.schema.nodes.blockquote.create({
      [`${quote.type}_id`]: quote.id,
      userId: quote.userId,
      nickname: quote.nickname
    }, fragment);
    const paragraph = state.schema.nodes.paragraph.create();

    const slice = new Slice(Fragment.from([quoteNode, paragraph]), 0, 0);

    insertSlice(slice)(state, dispatch);
  };
}
