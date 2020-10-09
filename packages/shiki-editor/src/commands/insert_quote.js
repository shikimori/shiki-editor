import insertNodes from './insert_nodes';
import { htmlToNodes } from '../utils';

export default function insertQuote(quote, editor) {
  return (state, dispatch) => {
    const fragment = htmlToNodes(editor, quote.html);

    const quoteNode = state.schema.nodes.blockquote.create({
      [`${quote.type}_id`]: quote.id,
      user_id: quote.user_id,
      nickname: quote.nickname
    }, fragment);

    insertNodes(quoteNode)(state, dispatch);
  };
}
