// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap/src/Utils/Mark.js
import { toggleMark } from 'prosemirror-commands';

import { markIsActive } from '../checks';
import Extension from './extension';

export default class Mark extends Extension {
  constructor(options = {}) {
    super(options);
  }

  get type() {
    return 'mark';
  }

  get schema() {
    return null;
  }

  commands({ type }) {
    return () => toggleMark(type);
  }

  activeCheck(type, state) {
    return markIsActive(type, state);
  }

  get markdownParserToken() {
    return { mark: this.name };
  }

  markdownSerializerToken() {
    return null;
  }
}
