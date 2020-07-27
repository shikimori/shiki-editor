import { nodeInputRule } from '../commands';
import { Node } from '../base';

export default class Hr extends Node {
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
      nodeInputRule(/^\[hr\]$/, type)
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
