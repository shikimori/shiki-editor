import { Node } from '../base';
import { ShikiView } from '../node_views';

export default class ShikiBlock extends Node {
  get name() {
    return 'shiki_block';
  }

  get schema() {
    return {
      attrs: {
        bbcode: {},
        id: {},
        type: {},
        openBbcode: {},
        closeBbcode: {},
        meta: { default: {} },
        isLoading: {},
        isError: {},
        nBeforeOpen: { default: true },
        nAfterOpen: { default: true },
        nBeforeClose: { default: true }
      },
      content: 'block*',
      group: 'block',
      draggable: false,
      selectable: false
    };
  }

  view(options) {
    return new ShikiView(options);
  }

  get markdownParserToken() {
    return {
      contentNode: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.write(node.attrs.bbcode);
  }
}
