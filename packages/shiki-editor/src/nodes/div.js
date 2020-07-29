import { Node } from '../base';
import { LIST_DEPRECATION_TEXT } from '../markdown/tokenizer/bbcode_helpers';

export default class Div extends Node {
  get name() {
    return 'div';
  }

  get schema() {
    return {
      attrs: {
        class: { default: null },
        data: { default: [] },
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
      parseDOM: [{
        tag: 'div[data-div]',
        getAttrs: node => ({
          class: node.getAttribute('class'),
          data: node
            .getAttributeNames()
            .filter(name => (
              name !== 'data-div' && name !== 'data-pm-slice' &&
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
          'div',
          {
            'data-div': (
              `[div${serializeClassAttr(node)}${serializeDataAttr(node)}]`
            ),
            ...attributes
          },
          0
        ];
      }
    };
  }

  markdownSerialize(state, node) {
    const meta = `${serializeClassAttr(node)}${serializeDataAttr(node)}`;

    if (meta === ` data-deperecation=${LIST_DEPRECATION_TEXT}`) {
      state.renderBlock(node, 'list', '', node.attrs.nFormat);
    } else {
      state.renderBlock(node, 'div', meta, node.attrs.nFormat);
    }
  }
}

function serializeClassAttr(node) {
  return node.attrs.class ? `=${node.attrs.class}` : '';
}

function serializeDataAttr(node) {
  if (!node.attrs.data.length) { return ''; }

  const data = node.attrs.data
    .map(v => (v[1] ? `${v[0]}=${v[1]}` : v[0]))
    .join(' ');

  return ` ${data}`;
}
