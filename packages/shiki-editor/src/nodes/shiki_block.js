import { Node } from '../base';
import { ShikiInlineView } from '../node_views';

export default class ShikiBlock extends Node {
  get name() {
    return 'shiki_block';
  }

  get schema() {
    return {
      attrs: {
        id: {},
        type: {},
        openBbcode: { },
        closeBbcode: { },
        isLoading: { default: true },
        isError: { default: false }
      },
      content: 'block+',
      group: 'block',
      draggable: false,
      selectable: false
    };
  }

  view(options) {
    return new ShikiInlineView(options);
  }

  get markdownParserToken() {
    return {
      block: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.write(node.attrs.bbcode);
  }
}
