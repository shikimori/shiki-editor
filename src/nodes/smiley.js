import { Node } from '../base';

export default class Smiley extends Node {
  get name() {
    return 'smiley';
  }

  get defaultOptions() {
    return { origin: undefined };
  }

  get schema() {
    return {
      inline: true,
      attrs: {
        kind: {}
      },
      group: 'inline',
      draggable: true,
      parseDOM: [{
        tag: 'img.smiley',
        getAttrs: node => ({
          kind: node.getAttribute('alt')
        })
      }],
      toDOM: node => ([
        'img',
        {
          class: 'smiley',
          alt: node.attrs.kind,
          title: node.attrs.kind,
          src: this.prependBaseUrl(`/images/smileys/${node.attrs.kind}.gif`)
        }
      ])
    };
  }

  commands({ type }) {
    return kind => (state, dispatch) => {
      if (kind == null) { return; }

      const { selection } = state;
      const position = selection.$cursor ?
        selection.$cursor.pos :
        selection.$to.pos;

      const node = type.create({ kind });
      const transaction = state.tr.insert(position, node);

      dispatch(transaction);
    };
  }

  get markdownParserToken() {
    return {
      node: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.write(node.attrs.kind);
  }
}
