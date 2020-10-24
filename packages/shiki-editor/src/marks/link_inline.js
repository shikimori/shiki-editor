// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/marks/LinkInline.js
import { Plugin } from 'prosemirror-state';
import { Mark } from '../base';
import {
  // updateMark,
  removeMark,
  insertLink,
  toggleMarkWrap,
  linkUrlPasteRule,
  linkBbcodePasteRule
} from '../commands';
import { getMarkAttrs, fixUrl } from '../utils';
import { addToShikiCache } from '../extensions';

import { bbcodeLabel } from '../markdown/tokenizer/processors/shiki_inline';

const NOT_LINKS = [
  '.prosemirror-block',
  '.b-mention',
  '.b-entry-404',
  '.b-image',
  '.b-video'
];

export default class LinkInline extends Mark {
  get name() {
    return 'link_inline';
  }

  get defaultOptions() {
    return {
      openOnClick: true,
      localizationField: 'name'
    };
  }

  get schema() {
    return {
      attrs: {
        url: {},
        id: { default: null },
        userId: { default: null },
        type: { default: null },
        text: { default: null },
        meta: {
          default: { isMention: false }
        }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]' + NOT_LINKS.map(v => `:not(${v})`).join(''),
          getAttrs: node => {
            let attrs = JSON.parse(node.getAttribute('data-attrs'));
            const url = node.href;

            if (!attrs) { // pasted common link
              attrs = { url };
            }

            if (attrs.russian) { // pasted from html
              const shikiData = {
                id: attrs.id,
                text: attrs[this.options.localizationField],
                url
              };
              attrs = {
                id: shikiData.id,
                type: attrs.type,
                text: shikiData.text,
                url
              };
              addToShikiCache(attrs.type, shikiData.id, shikiData);
            }

            return attrs;
          }
          // contentElement: node => {
          //   return (node.classList.contains('b-mention') && node.querySelector('span')) || node;
          // }
          // contentElement: node => (
          //   (node.classList.contains('b-mention') && node.querySelector('span')) || node
          // )
          // contentElement: node => {
          //   if (node.classList.contains('b-entry-404')) {
          //     return node.querySelector('del') || node;
          //   } else if (node.classList.contains('b-mention')) {
          //     return node.querySelector('span') || node;
          //   } else {
          //     return node;
          //   }
          // }
        }
      ],
      toDOM: node => ['a', {
        href: fixUrl(node.attrs.url),
        'data-attrs': JSON.stringify(node.attrs),
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

      if (!url) { return false; }
      const fixedUrl = fixUrl(url);

      if (from !== to) {
        return toggleMarkWrap(type, { url: fixedUrl });
      } else {
        return insertLink(type, { text: fixedUrl, url: fixedUrl });
      }
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
          const userId = mark.attrs.userId ? `;${mark.attrs.userId}` : '';
          return `[${mark.attrs.type}=${mark.attrs.id}${userId}` +
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
