// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/marks/LinkInline.js
import { Plugin } from 'prosemirror-state';
import { Mark } from '../base';
import {
  // updateMark,
  removeMark,
  toggleMarkWrap,
  linkUrlPasteRule,
  linkBbcodePasteRule
} from '../commands';
import { getMarkAttrs, fixUrl } from '../utils';

import { bbcodeLabel } from '../markdown/tokenizer/processors/shiki_inline';

export default class LinkInline extends Mark {
  get name() {
    return 'link_inline';
  }

  get defaultOptions() {
    return {
      openOnClick: true
    };
  }

  get schema() {
    return {
      attrs: {
        url: {},
        id: { default: null },
        type: { default: null },
        text: { default: null },
        meta: {
          default: { isMention: false }
        }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]:not(.prosemirror-block)',
          getAttrs: node => ({
            url: node.getAttribute('href'),
            id: node.getAttribute('data-id'),
            type: node.getAttribute('data-type'),
            text: node.getAttribute('data-text'),
            meta: {
              isMention: node.classList.contains('b-mention')
            }
          })
        }
      ],
      toDOM: node => ['a', {
        href: fixUrl(node.attrs.url),
        'data-id': node.attrs.id,
        'data-type': node.attrs.type,
        'data-text': node.attrs.text,
        class: node.attrs.meta.isMention ? 'b-mention' : 'b-link',
        // rel: 'noopener noreferrer nofollow',
        target: '_blank'
      }, 0]
    };
  }

  commands({ type }) {
    return (_, state) => {
      let marks = [];
      const { from, to } = state.selection;

      state.doc.nodesBetween(from, to, node => {
        marks = [...marks, ...node.marks];
      });
      const mark = marks.find(markItem => markItem.type.name === 'link_inline');

      if (mark) { return removeMark(type); }

      const url = prompt(
        window.I18n.t('frontend.shiki_editor.prompt.link_url')
      )?.trim();

      if (url) {
        return toggleMarkWrap(type, { url: fixUrl(url) });
      }
      return false;
    };
  }

  pasteRules({ type, schema }) {
    return [
      linkUrlPasteRule(type, schema, url => ({ url, text: url })),
      linkBbcodePasteRule(type)
    ];
  }

  get plugins() {
    if (!this.options.openOnClick) {
      return [];
    }

    return [
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
            const { schema } = view.state;
            const attrs = getMarkAttrs(schema.marks.link_inline, view.state);

            if (attrs.url && event.target instanceof HTMLAnchorElement) {
              event.stopPropagation();
              window.open(attrs.url);
            }
          }
        }
      })
    ];
  }

  get markdownParserToken() {
    return {
      mark: 'link_inline',
      getAttrs: token => token.serializeAttributes()
    };
  }

  get markdownSerializerToken() {
    return {
      isShortcut(mark, node) {
        return mark.attrs.type && mark.attrs.id && node.text == mark.attrs.text;
      },
      open(_state, mark, _parent, _index) {
        if (mark.attrs.type && mark.attrs.id) {
          return `[${mark.attrs.type}=${mark.attrs.id}` +
            `${bbcodeLabel(mark.attrs)}]`;
        } else if (mark.attrs.text === mark.attrs.url) {
          return '[url]';
        }

        return `[url=${mark.attrs.url}]`;
      },
      close(_state, mark, _parent, _index) {
        return mark.attrs.type && mark.attrs.id ?
          `[/${mark.attrs.type}]` :
          '[/url]';
      }
    };
  }
}
