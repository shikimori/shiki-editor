import {
  splitListItem,
  liftListItem,
  sinkListItem
} from 'prosemirror-schema-list';

import { Node } from '../base';

export default class ListItem extends Node {
  get name() {
    return 'list_item';
  }

  get schema() {
    return {
      attrs: {
        bbcode: { default: '- ' }
      },
      content: 'block*',
      defining: true,
      parseDOM: [{ tag: 'li' }],
      toDOM() { return ['li', 0]; }
    };
  }

  keys({ type }) {
    return {
      'Shift-Enter': splitListItem(type),
      Tab: sinkListItem(type),
      'Shift-Tab': liftListItem(type)
    };
  }

  markdownSerialize(state, node) {
    state.renderContent(node);
  }
}
