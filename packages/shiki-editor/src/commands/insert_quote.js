import insertNodes from './insert_nodes';
import { htmlToNodes } from '../utils';

export default function insertQuote(quote, view) {
  return (state, dispatch) => {
    debugger
    const fragment = htmlToNodes(view, quote.html);
    insertNodes(fragment)(state, dispatch);
  };
}
