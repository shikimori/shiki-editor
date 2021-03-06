import { Node } from '../base';
import { ShikiView } from '../node_views';
import NodeView from '../node_view';

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
        isLoading: { default: true },
        isError: { default: false },
        nFormat: {
          default: {
            nBeforeOpen: true,
            nAfterOpen: true,
            nBeforeClose: true
          }
        }
      },
      content: 'block*',
      group: 'block',
      draggable: false,
      selectable: false,
      toDOM: node => [
        'div',
        {
          class: 'b-shiki_editor-node',
          'data-attrs': JSON.stringify(node.attrs)
        },
        node.attrs.bbcode
      ]
    };
  }

  get view() {
    return NodeView.buildRenderer(ShikiView);
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
