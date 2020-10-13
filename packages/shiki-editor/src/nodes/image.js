// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/nodes/Image.js
import { Node } from '../base';
import { nodeInputRule } from '../commands';
import { ImageView } from '../node_views';

const IMAGE_INPUT_REGEX = /\[img\](.*?)\[\/img\]/;

export default class Image extends Node {
  get name() {
    return 'image';
  }

  get schema() {
    return {
      inline: true,
      attrs: {
        id: { default: null },
        src: {},
        isPoster: { default: false },
        width: { default: null },
        height: { default: null },
        isNoZoom: { default: false },
        class: { default: null },
        shikiData: { default: undefined }
      },
      group: 'inline',
      draggable: true,
      parseDOM: [{
        tag: '.b-image',
        getAttrs: node => {
          const attrs = JSON.parse(node.getAttribute('data-attrs'));
          attrs.src ||= node.tagName === 'A' ?
            node.href :
            node.querySelector('img').src;

          if (attrs.id) {
            attrs.shikiData = {
              id: attrs.id,
              url: attrs.src
            };
          }

          return attrs;
        }
      }, {
        tag: 'img.b-poster',
        getAttrs: node => ({ src: node.src, isPoster: true })
      }],
      toDOM: node => {
        const serializedAttributes = JSON.stringify(node.attrs);
        if (node.attrs.isPoster) {
          return [
            'img',
            {
              class: 'b-poster',
              src: node.attrs.src,
              'data-attrs': serializedAttributes
            }
          ];
        }

        const attrs = { src: node.attrs.src };
        if (node.attrs.width) {
          attrs.width = node.attrs.width;
        }
        if (node.attrs.height) {
          attrs.height = node.attrs.height;
        }
        const classes = ['b-image'];
        if (node.attrs.class) {
          classes.push(node.attrs.class);
        }
        if (node.attrs.isNoZoom) {
          classes.push('no-zoom');
        }

        return [
          'span',
          {
            class: classes.join(' '),
            'data-attrs': serializedAttributes
          },
          ['img', attrs]
        ];
      }
    };
  }

  get view() {
    return ImageView;
  }

  inputRules({ type }) {
    return [
      nodeInputRule(IMAGE_INPUT_REGEX, type, match => {
        const [, src] = match;
        return { src };
      })
    ];
  }

  commands({ type }) {
    return imageUrl => (state, dispatch) => {
      const src = imageUrl ||
        prompt(window.I18n.t('frontend.shiki_editor.prompt.image_url'));
      if (src == null) { return null; }

      const { selection } = state;
      const position = selection.$cursor ?
        selection.$cursor.pos :
        selection.$to.pos;

      const node = type.create({ src });
      const transaction = state.tr.insert(position, node);

      dispatch(transaction);

      return src;
    };
  }

  get markdownParserToken() {
    return {
      node: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    const prefix = tagPrefix(node);
    const startSequence = tagSequence(node);

    state.write(
      node.attrs.id ?
        startSequence :
        `${startSequence}${state.esc(node.attrs.src)}[/${prefix}]`
    );
  }
}

export function tagSequence(node) {
  const { attrs } = node;
  const prefix = tagPrefix(node);
  const suffix = serializeImageAttributes(node);

  return attrs.id ? `[${prefix}=${attrs.id}${suffix}]` : `[${prefix}${suffix}]`;
}

function tagPrefix(node) {
  const { attrs } = node;

  if (attrs.isPoster) {
    return 'poster';
  } else if (attrs.id) {
    return 'image';
  }
  return 'img';
}

function serializeImageAttributes(node) {
  const { attrs } = node;

  const attributes = [];
  if (attrs.isNoZoom) {
    attributes.push('no-zoom');
  }
  if (attrs.class) {
    attributes.push(`class=${attrs.class}`);
  }
  if (attrs.width && attrs.height) {
    attributes.push(`${attrs.width}x${attrs.height}`);
  } else {
    if (attrs.width) {
      attributes.push(`width=${attrs.width}`);
    }
    if (attrs.height) {
      attributes.push(`height=${attrs.height}`);
    }
  }

  return attributes.length ? ' ' + attributes.join(' ') : '';
}
