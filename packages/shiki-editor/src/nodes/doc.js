// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap/src/Nodes/Doc.js
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
