import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Node } from '../base';

export default class Heading extends Node {
  get name() {
    return 'heading';
  }

  get schema() {
    return {
      attrs: {
        level: {}
      },
      content: 'inline*',
      group: 'block',
      defining: true,
      draggable: false,
      parseDOM: [{
        tag: 'h2',
        attrs: { level: 1 }
      }, {
        tag: 'h3',
        attrs: { level: 2 }
      }, {
        tag: 'h4',
        attrs: { level: 3 }
      }, {
        tag: 'div.headline',
        attrs: { level: 4 }
      }, {
        tag: 'div.midheadline',
        attrs: { level: 5 }
      }],
      toDOM: node => {
        if (node.attrs.level <= 3) {
          return [`h${node.attrs.level + 1}`, 0];
        }
        const css_class = node.attrs.level === 4 ? 'headline' : 'midheadline';
        return ['div', { class: css_class }, 0];
      }
    };
  }

  inputRules({ type }) {
    return [1, 2, 3, 4, 5].map(level => textblockTypeInputRule(
      new RegExp(`^(#{1,${level}})\\s$`),
      type,
      () => ({ level })
    ));
  }

  get markdownParserToken() {
    return {
      block: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.write(state.repeat('#', node.attrs.level) + ' ');
    state.renderInline(node);
    state.closeBlock(node);
  }
}
