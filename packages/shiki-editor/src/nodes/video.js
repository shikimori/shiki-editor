import { Node } from '../base';
import { nodeInputRule } from '../commands';
import { VideoView } from '../node_views';
import { addToShikiCache } from '../extensions';

const VIDEO_INPUT_REGEX = /\[video\](.*?)\[\/video\]/;

export default class Video extends Node {
  get name() {
    return 'video';
  }

  get schema() {
    return {
      inline: true,
      attrs: {
        url: {},
        bbcode: {},
        hosting: { default: null },
        poster: { default: null },
        isLoading: { default: true },
        isError: { default: false },
        isBroken: { default: false }
      },
      group: 'inline',
      draggable: true,
      selectable: true,
      parseDOM: [{
        tag: '.b-video',
        getAttrs: node => {
          let attrs = JSON.parse(node.getAttribute('data-attrs'));
          if (attrs) { return attrs; }

          const url = node.querySelector('a').href;
          attrs = {
            url,
            bbcode: `[video]${url}[/video]`,
            poster: node.querySelector('img').src,
            hosting: node.className
              .replace(/c-video|b-video|fixed|shrinked-[\d_]+/g, '').trim(),
            isLoading: false
          };

          const shikiData = {
            id: attrs.url,
            hosting: attrs.hosting,
            poster: attrs.poster
          };
          addToShikiCache('video', shikiData.id, shikiData);

          return attrs;
        }
      }],
      // NOTE: simplified markup needed only to make copy-paste work
      toDOM: node => {
        const serializedAttributes = JSON.stringify(node.attrs);
        return [
          'span',
          {
            class: 'b-video',
            'data-attrs': serializedAttributes
          },
          ['a', { href: node.attrs.url }]
        ];
      }
    };
  }

  view(options) {
    return new VideoView(options);
  }

  inputRules({ type }) {
    return [
      nodeInputRule(VIDEO_INPUT_REGEX, type, match => {
        const [, url] = match;
        return { url, bbcode: `[video]${url}[/video]` };
      })
    ];
  }

  get markdownParserToken() {
    return {
      node: this.name,
      getAttrs: token => token.serializeAttributes()
    };
  }

  markdownSerialize(state, node) {
    state.write(node.attrs.bbcode);
  }
}
