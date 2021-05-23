import { LIST_DEPRECATION_TEXT } from '../markdown/tokenizer/bbcode_helpers';
import { Node } from '../base';
import { SwitcherView } from '../node_views';
import { TabsView } from '../node_views';
import NodeView from '../node_view';
import { serializeClassAttr, serializeDataAttr } from '../utils/div_helpers';

export default class Div extends Node {
  get name() {
    return 'div';
  }

  get schema() {
    return {
      attrs: {
        class: { default: null },
        data: { default: [] },
        meta: { default: {} },
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
              name !== 'data-div' && name.startsWith('data-')
                // && name !== 'data-pm-slice'
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

  get view() {
    return NodeView.buildRenderer(null, props => {
      const isTabs = props.node.attrs.data?.some(([name, value]) => (
        name === 'data-dynamic' && value === 'tabs'
      ));
      const isSwitcher = props.node.attrs.data?.some(([name, value]) => (
        name === 'data-dynamic' && value === 'switcher'
      ));

      if (isTabs) {
        return new TabsView(props);
      } else if (isSwitcher) {
        return new SwitcherView(props);
      }
      return null;
    });
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
