// https://github.com/scrumpy/tiptap/blob/v1/packages/tiptap-commands/src/commands/pasteRule.js
import { Plugin, PluginKey } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';
import { isContainsCodeMark } from '../utils';

const BEFORE_URL_ALLOWED_SYMBOL_REGEXP = /\s|>|\(/;

const URL_REGEXP = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)/gi; // eslint-disable-line
const SHIKI_URL_REGEXP = /^https?:\/\/shikimori\.(?:org|one|me|local)\/(animes|mangas|ranobe|characters|people)\/(\w+)[^/]*$/;

const VIDEO_REGEXPES = [
  // http://vimeo.com/426453510
  /(?:https?:)?\/\/(?:www\.)?vimeo.com\/[\wА-я_-]+(?:(?:\?|#|&amp;|&)[\w=+%-]+)*/,

  // https://youtube.com/watch?v=Z57Tn2F5JD8
  /(?:https?:)?\/\/(?:www\.)?youtube\.com\/.*?(?:&(?:amp;)?|\?)v=[\w_-]+[^ $#<[\]\r\n]*(?:#(?:t|at)=\d+)?/,
  /(?:https?:)?\/\/(?:www\.)?youtu.be\/[\w_-]+(?:\?(?:t|at)=\w+)?/,
  /(?:https?:)?\/\/(?:www\.)?youtube\.com\/(?:embed|v)\/[\w_-]+(?:\?start=\w+)?/,

  // https://www.youtube.com/shorts/yFg1-tIfvjc
  /(?:https?:)?\/\/(?:www\.)?youtube.com\/shorts\/[\w_-]+(?:\?(?:t|at)=\w+)?/,

  // http://vk.com/video98023184_165811692
  /(?:https?:)\/\/vk.com\/video-?\d+_\d+(?:(?:\?|#|&amp;|&)[\w=+%-]+)*/,

  // https://coub.com/view/1itox4
  /(?:https?:)\/\/(?:www\.)?coub.com\/view\/[\wА-я_-]+(?:(?:\?|#|&amp;|&)[\w=+%-]+)*/,

  // http://video.sibnet.ru/video1234982-03__Poverivshiy_v_grezyi
  // https://video.sibnet.ru/video305613-SouL_Eater__AMW/
  /(?:https?:)\/\/(?:www\.)?video.sibnet.ru\/(?:video[\wА-я_-]+|shell.php\?videoid=[\wА-я_-]+)(?:(?:\?|#|&amp;|&)[\w=+%-]+)*/,

  // https://stormo.xyz/videos/245/stiv-djobs/
  // /(?:https?:)\/\/(?:www\.)?stormo.(?:xyz|tv)\/videos\/[\wА-я_-]+\/[\wА-я_-]+\//,
  // https://ok.ru/video/2444260543117
  /(?:https?:)\/\/(?:www\.)?ok.ru\/(?:videoembed|live|video)\/[\wА-я_-]+(?:(?:\?|#|&amp;|&)[\w=+%-]+)*/,

  // https://rutube.ru/video/d1be34b762250dd49b5be35d805e5f9d/
  /(?:https?:)?\/\/(?:www\.)?rutube.ru\/video\/[\w_-]+\/?(?:\?(?:t|at)=\w+)?/,

  //https://rutube.ru/shorts/c9c281676b7420be84f19b808f1e4349/
  /(?:https?:)?\/\/(?:www\.)?rutube.ru\/shorts\/[\w_-]+\/?(?:\?(?:t|at)=\w+)?/
];

const SHIKI_TYPES = {
  animes: 'anime',
  mangas: 'manga',
  ranobe: 'ranobe',
  characters: 'character',
  people: 'person'
};

export default function linkUrlPasteRule(type, schema, getAttrs) {
  const handler = fragment => {
    const nodes = [];

    fragment.forEach(child => {
      if (child.type.spec.code || isContainsCodeMark(child)) {
        nodes.push(child);
      } else if (child.isText) {
        const { text } = child;
        let pos = 0;
        let match;

        while ((match = URL_REGEXP.exec(text)) != null) {
          const symbolBeforeUrl = text[match.index - 1];

          if (symbolBeforeUrl != null &&
            !BEFORE_URL_ALLOWED_SYMBOL_REGEXP.exec(symbolBeforeUrl)
          ) {
            continue;
          }

          const start = match.index;
          const [url] = match;
          const end = start + url.length;
          const attrs = getAttrs instanceof Function ? getAttrs(url) : getAttrs;

          if (start > 0) {
            nodes.push(child.cut(pos, start));
          }

          const shikiMatch = url.match(SHIKI_URL_REGEXP);
          const videoMatch = !shikiMatch && VIDEO_REGEXPES.some(regexp => (
            url.match(regexp)
          ));

          if (shikiMatch) {
            const id = parseInt(shikiMatch[2].replace(/[A-z]+/, ''));
            const type = SHIKI_TYPES[shikiMatch[1]];
            const shikiAttrs = { id, type, bbcode: `[${type}=id]` };

            child.cut(start, end);
            nodes.push(
              schema.nodes.shiki_inline.create(shikiAttrs)
            );
          } else if (videoMatch) {
            child.cut(start, end);
            nodes.push(
              schema.nodes.video.create({
                url,
                bbcode: `[video]${url}[/video]`
              })
            );
          } else {
            nodes.push(child
              .cut(start, end)
              .mark(type.create(attrs).addToSet(child.marks)));
          }

          pos = end;
        }

        if (pos < text.length) {
          nodes.push(child.cut(pos));
        }
      } else {
        nodes.push(child.copy(handler(child.content)));
      }
    });

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    key: new PluginKey('link_url_paste_rule'),
    props: {
      transformPasted: slice => (
        new Slice(handler(slice.content), slice.openStart, slice.openEnd)
      )
    }
  });
}
