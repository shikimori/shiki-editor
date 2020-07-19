// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/marks/LinkInline.js
import { Plugin } from 'prosemirror-state';
import { Mark } from '../base';
import { updateMark, removeMark, pasteRule } from '../commands';
import { getMarkAttrs, fixUrl } from '../utils';

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
        href: {}
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]:not(.prosemirror-block)',
          getAttrs: node => ({
            href: node.getAttribute('href')
          })
        }
      ],
      toDOM: node => ['a', {
        href: fixUrl(node.attrs.href),
        class: 'b-link',
        rel: 'noopener noreferrer nofollow',
        target: '_blank'
      }, 0]
    };
  }

  commands({ type }) {
    return (_attrs, state) => {
      let marks = [];
      const { from, to } = state.selection;

      state.doc.nodesBetween(from, to, node => {
        marks = [...marks, ...node.marks];
      });

      const mark = marks.find(markItem => markItem.type.name === 'link_inline');

      if (mark && mark.attrs.href) {
        return removeMark(type);
      }
      const href = prompt(window.I18n.t('frontend.shiki_editor.prompt.link_url'));
      return href ?
        updateMark(type, { href: fixUrl(href) }) :
        () => {};
    };
  }

  pasteRules({ type }) {
    return [
      pasteRule(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g, // eslint-disable-line
        type,
        url => ({ href: url })
      )
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

            if (attrs.href && event.target instanceof HTMLAnchorElement) {
              event.stopPropagation();
              window.open(attrs.href);
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
      open(_state, mark, _parent, _index) {
        return `[url=${mark.attrs.href}]`;
      },
      close: '[/url]'
    };
  }
}
