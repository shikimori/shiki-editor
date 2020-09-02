import { Node } from '../base';
import { serializeClassAttr, serializeDataAttr } from './div';

export class Span extends Node {
  get name() {
    return 'span';
  }

  get schema() {
    return {
      attrs: {
        class: { default: null },
        data: { default: [] },
      },
      inline: true,
      content: 'inline*',
      group: 'inline',
      parseDOM: [{
        tag: 'span[data-span]',
        getAttrs: node => ({
          class: node.getAttribute('class'),
          data: node
            .getAttributeNames()
            .filter(name => (
              name !== 'data-span' && name !== 'data-pm-slice' &&
                name.startsWith('data-')
            ))
            .map(attribute => [attribute, node.getAttribute(attribute)])
        })
      }],
      toDOM: node => {
        const attributes = {};

        if (node.attrs.class) {
          attributes.class = node.attrs.class;
        }
        node.attrs.data.forEach(data => attributes[data[0]] = data[1]); // eslint-disable-line

        return [
          'span',
          {
            'data-span': (
              `[span${serializeClassAttr(node)}${serializeDataAttr(node)}]`
            ),
            ...attributes
          },
          0
        ];
      }
    };
  }

  markdownSerialize(state, node) {
    // const meta = `${serializeClassAttr(node)}${serializeDataAttr(node)}`;
    // state.renderBlock(node, 'div', meta, node.attrs.nFormat);
  }

  get markdownParserToken() {
    return {
      contentNode: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  // markdownSerialize(state, node) {
  //   state.write(node.attrs.bbcode);
  // }
}
