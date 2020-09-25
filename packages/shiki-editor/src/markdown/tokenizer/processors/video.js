import Token from '../token';
import { extractUntil } from '../helpers';
import { CACHE } from '../../../extensions/shiki_loader';

export default function processVideo(state, tagStart, tagEnd) {
  const index = state.index + tagStart.length;
  const url = extractUntil(state.text, tagEnd, index, index + 255);

  if (url) {
    const bbcode = `${tagStart}${url}${tagEnd}`;
    const cache = CACHE.video?.[url];
    const meta = { url, bbcode };

    if (cache) {
      meta.poster = cache.poster;
      meta.hosting = cache.hosting;
      meta.isLoading = false;
    }

    state.inlineTokens.push(
      new Token('video', null, null, meta)
    );
    state.next(bbcode.length);
    return true;
  }

  return false;
}

