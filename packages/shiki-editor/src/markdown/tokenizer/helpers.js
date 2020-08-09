export function extractBbCode(text, startIndex, maxIndex) {
  let bracketsNesting = 0;

  for (let i = startIndex + 1; i <= (maxIndex || text.length); i++) {
    const char = text[i];
    const isEnd = char === '\n' || char === undefined;

    if (isEnd) { return null; }

    if (char === '[') {
      bracketsNesting += 1;
      continue;
    }

    if (char === ']') {
      if (bracketsNesting > 0) {
        bracketsNesting -= 1;
        continue;
      }

      return text.slice(startIndex, i + 1);
    }
  }
  return null;
}

export function extractUntil(
  text,
  sequence,
  startIndex,
  maxIndex = startIndex + 1000,
  isIgnoreNewLine = false
) {
  for (let i = startIndex; i <= (maxIndex || text.length); i++) {
    const char = text[i];
    const isEnd = isIgnoreNewLine ?
      (char === undefined) :
      (char === '\n' || char === undefined);

    if (char === sequence[0] && (
      sequence.length === 1 || text.slice(i, i + sequence.length) === sequence
    )) {
      return text.slice(startIndex, i);
    }
    if (isEnd) { return null; }
  }
  return null;
}

export function hasInlineSequence(text, sequence, startIndex, maxIndex) {
  for (let i = startIndex + 1; i <= (maxIndex || text.length); i++) {
    const char = text[i];
    const isEnd = char === '\n' || char === undefined;

    if (char === sequence[0] && (
      sequence.length === 1 || text.slice(i, i + sequence.length) === sequence
    )) {
      return true;
    }
    if (isEnd) { return false; }
  }
  return false;
}

export function extractMarkdownLanguage(text, startIndex) {
  let index = startIndex;

  while (index <= text.length) {
    const isEnd = text[index] === '\n' || text[index] === undefined;

    if (isEnd) {
      return text.slice(startIndex, index);
    }
    index += 1;
  }

  return null;
}

export function isMatchedToken(token, type, direction) {
  return !!token && token.type === type && token.direction === direction;
}

export function rollbackUnbalancedTokens(tokens) {
  const cache = {};

  tokens.forEach((token, index) => {
    if (!token.direction) { return; }
    if (!cache[token.type]) { cache[token.type] = false; }

    if (token.direction === 'open') {
      if (cache[token.type]) {
        tokens[index] = { type: 'text', content: token.bbcode };
      } else {
        cache[token.type] = true;
      }
    } else if (cache[token.type]) {
      cache[token.type] = false;
    } else {
      tokens[index] = { type: 'text', content: token.bbcode };
    }
  });

  Object.entries(cache).forEach(([type, isUnbalanced]) => {
    if (!isUnbalanced) { return; }

    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].type === type && tokens[i].direction === 'open') {
        tokens[i] = { type: 'text', content: tokens[i].bbcode };
        return;
      }
    }
  });

  return tokens;
}
