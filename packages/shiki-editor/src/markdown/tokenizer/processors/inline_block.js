import { isMatchedToken } from '../helpers';

export default function processInlineBlock(state, startSequence, exitSequence) {
  const tokenizer = new state.constructor(
    state.text,
    state.index + startSequence.length,
    '',
    exitSequence
  );
  const tokens = tokenizer.parse();

  if (!tokens) { return; }
  // const endSequence =
  //   state.text.slice(tokenizer.index, tokenizer.index + exitSequence.length);
  // if (endSequence !== exitSequence) { return false; }

  state.appendInlineContent(startSequence);

  let slicedTokens;
  let isNewLineAtEnd = false;

  // append first paragraph to current inlineTokens
  if (isMatchedToken(tokens[0], 'paragraph', 'open')) {
    tokens[1].children.forEach(token => {
      if (token.type === 'text') {
        state.appendInlineContent(token.content, false);
      } else {
        state.inlineTokens.push(token);
      }
    });
    slicedTokens = tokens.slice(3);
    // close parahraph after prior content was joined
    if (slicedTokens.length) {
      state.finalizeParagraph();
    }
  } else {
    slicedTokens = tokens;
  }

  state.index = tokenizer.index;

  // insert new line at the end to maintain original formatting
  if (isMatchedToken(tokens[tokens.length - 1], 'paragraph', 'close')) {
    if (state.text[state.index - 1] === '\n') {
      isNewLineAtEnd = true;
      state.finalizeParagraph();
    }
  }

  // unwrap final paragraph
  if (!isNewLineAtEnd && slicedTokens.length &&
    isMatchedToken(slicedTokens[slicedTokens.length - 1], 'paragraph', 'close')
  ) {
    state.inlineTokens = slicedTokens[slicedTokens.length - 2].children;
    slicedTokens = slicedTokens.slice(0, slicedTokens.length - 3);
  }

  state.tokens = [...state.tokens, ...slicedTokens];

  state.appendInlineContent(exitSequence);

  return true;
}
