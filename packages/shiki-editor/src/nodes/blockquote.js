import { wrappingInputRule } from 'prosemirror-inputrules';

import { Node } from '../base';
import { nodeIsActive } from '../checks';
import { toggleWrap } from '../commands';

export default class Blockquote extends Node {
  get name() {
    return 'blockquote';
  }

  get schema() {
    return {
      content: 'block*',
      group: 'block',
      defining: true,
      draggable: false,
      attrs: {
        comment_id: { default: undefined },
        message_id: { default: undefined },
        topic_id: { default: undefined },
        user_id: { default: undefined },
        nickname: { default: undefined }
      },
      parseDOM: [{ tag: 'blockquote' }],
      toDOM() { return ['blockquote', { class: 'b-quote-v2' }, 0]; }
    };
  }

  commands({ type, schema }) {
    return () => toggleWrap(type, schema.nodes.paragraph);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  keys({ type }) {
    return {
      'Ctrl->': toggleWrap(type)
    };
  }

  inputRules({ type }) {
    return [
      wrappingInputRule(/^\s*>\s$/, type)
    ];
  }

  markdownSerialize(state, node) {
    state.wrapBlock('> ', null, node, () => state.renderContent(node));
  }
}
