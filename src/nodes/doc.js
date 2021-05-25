// https://github.com/scrumpy/tiptap/blob/v1/packages/tiptap/src/Nodes/Doc.js
import { Node } from '../base';

export default class Doc extends Node {
  get name() {
    return 'doc';
  }

  get schema() {
    return {
      content: 'block+'
    };
  }

  get markdownParserToken() {
    return null;
  }
}
