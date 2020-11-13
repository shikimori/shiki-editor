import { Mark } from '../base';
// import { markInputRule, markPasteRule } from '../commands';

export default class ItalicInline extends Mark {
  get name() {
    return 'italic_inline';
  }

  get schema() {
    return {
      rank: 5,
      parseDOM: [
        { tag: 'i' },
        { tag: 'em' }
        // { style: 'font-style=italic' }
      ],
      toDOM: () => ['em', 0]
    };
  }

  keys({ type }) {
    return {
      'Mod-i': (state, dispatch) => this.commands({ type })()(state, dispatch)
    };
  }

  // inputRules({ type }) {
  //   return [
  //     markInputRule(/(?:^|[^_])(_([^_]+)_)$/, type),
  //     markInputRule(/(?:^|[^*])(\*([^*]+)\*)$/, type)
  //   ];
  // }
  //
  // pasteRules({ type }) {
  //   return [
  //     markPasteRule(/_([^_]+)_/g, type),
  //     markPasteRule(/\*([^*]+)\*/g, type)
  //   ];
  // }

  get markdownSerializerToken() {
    return {
      open: '[i]',
      close: '[/i]',
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
}
