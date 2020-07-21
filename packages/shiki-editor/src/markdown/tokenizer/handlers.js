import Token from './token';
import { extractMarkdownLanguage, extractUntil, } from './helpers';

export function processBlock(
  tokenizer,
  type,
  startSequence,
  exitSequence,
  metaAttributes,
  isStart = true,
  isOnlySpacingsBefore = false
) {
  let index = tokenizer.index + startSequence.length;
  if (tokenizer.text[index] === '\n') { index += 1; }

  const innerTokenizer = new tokenizer.constructor(
    tokenizer.text,
    index,
    tokenizer.nestedSequence,
    exitSequence
  );
  const tokens = innerTokenizer.parse();

  if (!tokens) { return false; }

  if (isOnlySpacingsBefore) {
    tokenizer.inlineTokens = [];
  } else if (!isStart) {
    tokenizer.finalizeParagraph();
  }

  tokenizer.next(startSequence.length);
  tokenizer.push(tokenizer.tagOpen(type, metaAttributes), true);

  tokenizer.tokens = tokenizer.tokens.concat(tokens);
  tokenizer.index = innerTokenizer.index;

  tokenizer.next(exitSequence.length, true);
  tokenizer.push(tokenizer.tagClose(type));

  return true;
}

export function processPseudoBlock(
  tokenizer,
  type,
  startSequence,
  endSequence,
  meta,
  isStart,
  isOnlySpacingsBefore
) {
  const index = tokenizer.index + startSequence.length;
  const isNewLineAhead = tokenizer.text[index] === '\n';

  if (!isNewLineAhead) {
    const content = extractUntil(
      tokenizer.text,
      endSequence,
      index,
      null,
      isNewLineAhead
    );
    if (!tokenizer.PSEUDO_BLOCK_TEST_REGEXP.test(content)) { return false; }
  }

  return processBlock(
    tokenizer,
    type, startSequence, endSequence,
    meta, isStart, isOnlySpacingsBefore
  );
}

export function processCodeBlock(
  tokenizer,
  startSequence,
  endSequence,
  meta,
  isStart,
  isOnlySpacingsBefore
) {
  const isMarkdown = startSequence === '```';
  let index = tokenizer.index + startSequence.length;
  let language;

  if (isMarkdown) {
    language = extractMarkdownLanguage(tokenizer.text, index);
    index += language ? language.length + 1 : 1;
  } else {
    if (meta && meta.language) {
      language = meta.language;
    }
    if (tokenizer.text[index] === '\n') {
      index += 1;
    }
  }

  const startIndex = index;
  let isEnded = false;

  while (index <= tokenizer.text.length) {
    if (tokenizer.text[index] === endSequence[0] &&
      tokenizer.text.slice(index, index + endSequence.length) === endSequence
    ) {
      isEnded = true;
      break;
    }
    index += 1;
  }
  if (!isEnded) {
    return false;
  }

  const endIndex = isMarkdown ?
    index :
    tokenizer.text[index - 1] === '\n' ? index - 1 : index;
  const text = tokenizer.text.slice(startIndex, endIndex);
  const languageAttr = language ? [['language', language]] : null;
  index += endSequence.length;

  if (isOnlySpacingsBefore) {
    tokenizer.inlineTokens = [];
  } else if (!isStart) {
    tokenizer.finalizeParagraph();
  }

  tokenizer.push(new Token('code_block', text, null, languageAttr));
  tokenizer.next(index - tokenizer.index, true);

  return true;
}
