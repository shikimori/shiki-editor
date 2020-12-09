import { Mark } from '../base';
import { markInputRule, markPasteRule } from '../commands';
import { SpoilerInlineView } from '../node_views';

export default class SpoilerInline extends Mark {
  get name() {
    return 'spoiler_inline';
  }

  get schema() {
    return {
      rank: 0,
      attrs: {
        isOpened: { default: true }
      },
      preventSuggestion: true,
      parseDOM: [{
        tag: 'span.b-spoiler_inline',
        getAttrs: node => ({
          isOpened: node.classList.contains('is-opened')
        })
      }],
      toDOM: node => [
        'span',
        {
          class: `b-spoiler_inline${node.attrs.isOpened ? ' is-opened' : ''}`,
          tabindex: 0
        },
        ['span', 0]
      ]
    };
  }

  view(options) {
    return new SpoilerInlineView(options);
  }

  inputRules({ type }) {
    return [
      markInputRule(/(?:\|\|)([^|]+)(?:\|\|)$/, type)
    ];
  }

  pasteRules({ type }) {
    return [
      markPasteRule(/(?:\|\|)([^|]+)(?:\|\|)/g, type)
    ];
  }

  get markdownSerializerToken() {
    return {
      open: '||',
      close: '||',
      mixable: true,
      expelEnclosingWhitespace: true
    };
  }
}
