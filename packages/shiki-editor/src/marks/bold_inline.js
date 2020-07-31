import { Mark } from '../base';
import { markInputRule, markPasteRule } from '../commands';

export default class BoldInline extends Mark {
  get name() {
    return 'bold_inline';
  }

  get schema() {
    return {
      parseDOM: [{
        tag: 'strong'
      }, {
        tag: 'b',
        getAttrs: node => node.style.fontWeight !== 'normal' && null
      }
      // {
      //   style: 'font-weight',
      //   getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
      // }
      ],
      toDOM: () => ['strong', 0]
    };
  }

  keys({ type }) {
    return {
      'Mod-b': (state, dispatch) => this.commands({ type })()(state, dispatch)
    };
  }

  inputRules({ type }) {
    return [
      markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type)
    ];
  }

  pasteRules({ type }) {
    return [
      markPasteRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)/g, type)
    ];
  }

  get markdownSerializerToken() {
    return {
      open: '[b]',
      close: '[/b]',
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
}
