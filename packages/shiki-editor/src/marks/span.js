import { Mark } from '../base';
import { serializeClassAttr, serializeDataAttr } from '../utils/div_helpers';
import { SwitcherView } from '../node_views';

export default class Span extends Mark {
  get name() {
    return 'span';
  }

  get schema() {
    return {
      attrs: {
        class: { default: null },
        data: { default: [] }
      },
      parseDOM: [{
        tag: 'span[data-span]',
        getAttrs: node => ({
          class: node.getAttribute('class'),
          data: node
            .getAttributeNames()
            .filter(name => (
              name !== 'data-span' && name.startsWith('data-')
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

  view(options) {
    const isSwitcher = options.node.attrs.data?.some(([name, value]) => (
      name === 'data-dynamic' && value === 'switcher'
    ));

    if (isSwitcher) {
      return new SwitcherView(options);
    }
  }

  get markdownParserToken() {
    return {
      mark: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  get markdownSerializerToken() {
    return {
      open(_state, mark, _parent, _index) {
        const meta = `${serializeClassAttr(mark)}${serializeDataAttr(mark)}`;
        return `[span${meta}]`;
      },
      close: '[/span]',
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }

}
