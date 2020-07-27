import { nodeInputRule, pasteRule } from '../commands';
import { Node } from '../base';

export default class Hr extends Node {
  BBCODE_REGEXP = /^\[hr\]$/

  get name() {
    return 'hr';
  }

  get schema() {
    return {
      group: 'block',
      parseDOM: [{
        tag: 'hr'
      }],
      toDOM: () => ['hr']
    };
  }

  inputRules({ type }) {
    return [
      nodeInputRule(/^(?:---|___\s|\*\*\*\s)$/, type),
      nodeInputRule(this.BBCODE_REGEXP, type)
    ];
  }

  pasteRules({ type }) {
    return [
      pasteRule(this.BBCODE_REGEXP, type)
    ];
  }


  get markdownParserToken() {
    return { node: this.name };
  }

  markdownSerialize(state, node) {
    state.write('[hr]');
    state.closeBlock(node);
  }
}
