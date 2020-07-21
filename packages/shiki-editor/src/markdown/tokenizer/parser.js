import Token from './token';

import {
  extractBbCode,
  extractUntil,
  extractUntilWith,
  hasInlineSequence,
  isMatchedToken,
  rollbackUnbalancedTokens
} from './helpers';
import {
  parseCodeMeta,
  parseDivMeta,
  parseImageMeta,
  parseLinkMeta,
  parseQuoteMeta,
  parseSizeMeta,
  parseSpoilerMeta
} from './bbcode_helpers';

import processBlockQuote from './processors/block_quote';
import processBulletList from './processors/bulle_list';
import processBlock from './processors/block';
import processPseudoBlock from './processors/pseudo_block';
import processCodeBlock from './processors/code_block';
import processCodeInline from './processors/code_inline';

export default class MarkdownTokenizer {
  MAX_BBCODE_SIZE = 512
  MAX_SMILEY_SIZE = 18

  BLOCK_BBCODE_REGEXP = /^\[(?:quote|spoiler|code)(?:=(.+?))?\]$/
  DIV_REGEXP = /^\[div(?:(?:=| )([^\]]+))?\]$/
  COLOR_REGEXP = /^\[color=(#[\da-f]+|\w+)\]$/
  SIZE_REGEXP = /^\[size=(\d+)\]$/
  LINK_REGEXP = /^\[url=(.+?)\]$/
  EMPTY_SPACES_REGEXP = /^ +$/

  PSEUDO_BLOCK_TEST_REGEXP = /\[(?:quote|div|spoiler|right|center)/

  SMILEY_REGEXP = /^:(?:!|8\)|Ban|Bath2|Cry2|Cry3|Cry4|Happy Birthday|Im dead|V2|V3|V|Warning|advise|angry2|angry3|angry4|angry5|angry6|angry|animal|ball|bath|bdl2|bdl|bored|bow|bullied|bunch|bye|caterpillar|cold2|cold|cool2|cool|cry5|cry6|cry|dance|depressed2|depressed|diplom|disappointment|dont listen|dont want|dunno|evil2|evil3|evil|flute|frozen2|frozen3|frozen|gamer|gaze|happy3|happy|happy_cry|hi|hope2|hope3|hope|hopeless|hot2|hot3|hot|hunf|hurray|hypno|ill|interested|kia|kiss|kya|liar|lol|love2|love|noooo|oh2|oh|ololo|ooph|perveted|play|prcl|relax|revenge|roll|s1|s2|s3|s4|s|sad2|sarcasm|scared|scream|shock2|shock|shocked2|shocked3|shocked4|shocked|shy2|shy|sick|sleep|sleepy|smoker2|smoker|star|strange1|strange2|strange3|strange4|strange|stress|study2|study3|study|tea shock|tea2|thumbup|twisted|very sad2|very sad|watching|water|whip|wink|yahoo):$/

  MARK_STACK_MAPPINGS = {
    color: '[color]',
    size: '[size]'
  }

  constructor(text, index, nestedSequence = '', exitSequence = undefined) {
    this.text = text;
    this.index = index;

    this.nestedSequence = nestedSequence;
    this.exitSequence = exitSequence;
    this.isExitSequence = false;

    this.tokens = [];
    this.inlineTokens = [];
    this.marksStack = [];
    this.paragraphToken = null;
  }

  static parse(text) {
    return new MarkdownTokenizer(text, 0).parse();
  }

  parse() {
    this.index -= 1;
    this.next();

    while (this.index < this.text.length) {
      this.parseLine();
      if (this.isExitSequence) { break; }
    }

    if (this.exitSequence && !this.isExitSequence) {
      return null;
    }
    return this.tokens;
  }

  parseLine(skippableSequence = '') {
    if (this.isSkippableSequence(skippableSequence || this.nestedSequence)) {
      this.next((skippableSequence || this.nestedSequence).length);
    }

    const startIndex = this.index;
    let match;

    outer: while (this.index <= this.text.length) { // eslint-disable-line no-restricted-syntax
      const { char1, seq2, seq3, seq4, seq5, bbcode } = this;

      const isStart = startIndex === this.index;
      const isEnd = char1 === '\n' || char1 === undefined;

      let meta;
      let isProcessed = false;
      const isOnlySpacingsBefore = this.isOnlyInlineSpacingsBefore();

      if (this.isExitSequence) {
        this.finalizeParagraph();
        return;
      }

      if (isEnd) {
        this.finalizeParagraph();
        this.next();
        // add aditional parahraph when meet \n before exitSequesnce
        // if (this.isExitSequence) { this.finalizeParagraph(); }
        return;
      }

      if (isStart) {
        switch (seq5) {
          case '#### ':
            this.processHeading(seq5, 4);
            break outer;

          case '#####':
            if (this.text[this.index + 5] === ' ') {
              this.processHeading(seq5 + ' ', 5);
              break outer;
            }
        }

        switch (seq4) {
          case '### ':
            this.processHeading(seq4, 3);
            break outer;
        }

        switch (seq3) {
          case '```':
            if (processCodeBlock(this, seq3, '\n```', null, true)) {
              break outer;
            }
            break;

          case '## ':
            this.processHeading(seq3, 2);
            break outer;
        }

        switch (seq2) {
          case '> ':
            processBlockQuote(this, seq2);
            break outer;

          case '- ':
          case '+ ':
          case '* ':
            processBulletList(this, seq2);
            break outer;

          case '# ':
            this.processHeading(seq2, 1);
            break outer;
        }

        switch (bbcode) {
          case '[*]':
            processBulletList(
              this,
              this.text[this.index + bbcode.length] === ' ' ?
                bbcode + ' ' :
                bbcode
            );
            break outer;

          // case '[list]':
          //   meta = { data: [['data-list', 'remove-it']] };
          //   isProcessed = processBlock(
          //     this,
          //     'div', bbcode, '[/list]', meta,
          //     isStart, isOnlySpacingsBefore
          //   );
          //   if (isProcessed) { return; }
          //   break;
        }
      }

      if (bbcode && (isStart || isOnlySpacingsBefore)) {
        if (seq4 === '[div' && (match = bbcode.match(this.DIV_REGEXP))) {
          meta = parseDivMeta(match[1]);
          isProcessed = processBlock(
            this,
            'div', bbcode, '[/div]', meta,
            isStart, isOnlySpacingsBefore
          );
          if (isProcessed) { return; }
        }
        if (seq5 === '[spoi' && (match = bbcode.match(this.BLOCK_BBCODE_REGEXP))) {
          isProcessed = processBlock(
            this,
            'spoiler_block', bbcode, '[/spoiler]', parseSpoilerMeta(match[1]),
            isStart, isOnlySpacingsBefore
          );
          if (isProcessed) { return; }
        }

        if (seq4 === '[url' && (match = bbcode.match(this.LINK_REGEXP))) {
          isProcessed = processPseudoBlock(
            this,
            'link_block', bbcode, '[/url]', parseLinkMeta(match[1]),
            isStart, isOnlySpacingsBefore
          );
          if (isProcessed) { return; }
        }

        if (seq5 === '[size' && (match = bbcode.match(this.SIZE_REGEXP))) {
          isProcessed = processPseudoBlock(
            this,
            'size_block', bbcode, '[/size]', parseSizeMeta(match[1]),
            isStart, isOnlySpacingsBefore
          );
          if (isProcessed) { return; }
        }
      }

      if (bbcode) {
        if (bbcode === '[center]') {
          isProcessed = processBlock(
            this,
            'center', bbcode, '[/center]', null,
            isStart, isOnlySpacingsBefore
          );
          if (isProcessed) { return; }
        }

        if (bbcode === '[right]') {
          isProcessed = processBlock(
            this,
            'right', bbcode, '[/right]', null,
            isStart, isOnlySpacingsBefore
          );
          if (isProcessed) { return; }
        }

        if (seq5 === '[code' && (match = bbcode.match(this.BLOCK_BBCODE_REGEXP))) {
          const meta = parseCodeMeta(match[1]);
          if (isStart || meta) {
            isProcessed = processCodeBlock(
              this,
              bbcode, '[/code]', meta,
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed) { return; }
          }
        }

        if (seq5 === '[quot' && (match = bbcode.match(this.BLOCK_BBCODE_REGEXP))) {
          isProcessed = processBlock(
            this,
            'quote', bbcode, '[/quote]', parseQuoteMeta(match[1]),
            isStart, isOnlySpacingsBefore
          );
          if (isProcessed) { return; }
        }
      }

      if (this.processInline(char1, bbcode, seq2, seq3, seq4, seq5)) {
        break;
      }
    }
  }

  processInline(char1, bbcode, seq2, seq3, seq4, seq5) {
    switch (bbcode) {
      case '[b]':
        if (this.processMarkOpen('bold', '[b]', '[/b]')) { return; }
        break;

      case '[/b]':
        if (this.processMarkClose('bold', '[b]', '[/b]')) { return; }
        break;

      case '[i]':
        if (this.processMarkOpen('italic', '[i]', '[/i]')) { return; }
        break;

      case '[/i]':
        if (this.processMarkClose('italic', '[i]', '[/i]')) { return; }
        break;

      case '[u]':
        if (this.processMarkOpen('underline', '[u]', '[/u]')) { return; }
        break;

      case '[/u]':
        if (this.processMarkClose('underline', '[u]', '[/u]')) { return; }
        break;

      case '[s]':
        if (this.processMarkOpen('strike', '[s]', '[/s]')) { return; }
        break;

      case '[/s]':
        if (this.processMarkClose('strike', '[s]', '[/s]')) { return; }
        break;

      case '[/url]':
        if (this.processMarkClose('link_inline', '[url]', '[/url]')) { return; }
        break;

      case '[/color]':
        if (this.processMarkClose('color', '[color]', '[/color]')) { return; }
        break;

      case '[/size]':
        if (this.processMarkClose('size', '[size]', '[/size]')) { return; }
        break;

      case '[poster]':
        if (this.processImage(bbcode, '[/poster]', true)) { return; }
        break;

      case '[code]':
        if (processCodeInline(this, bbcode, '[/code]')) { return; }
        break;

      case '[hr]':
        this.processHr(bbcode);
        return true;

      case '[br]':
        this.next(bbcode.length);
        this.finalizeParagraph();
        return true;

      default:
        break;
    }

    if (seq2 === '||' && seq3 !== '|||') {
      if (this.lastMark !== seq2) {
        if (this.processMarkOpen('spoiler_inline', '||', '||')) { return; }
      } else if (this.processMarkClose('spoiler_inline', '||', '||')) { return; }
    }

    if (char1 === '`') {
      if (processCodeInline(this, char1)) { return; }
    }

    if (char1 === ':' || char1 === '+') {
      if (this.processSmiley(char1, seq2, seq3)) { return; }
    }

    let match;
    let meta;

    if (bbcode) {
      switch (seq4) {
        case '[div':
          if (this.processInlineBlock(bbcode, '[/div]')) {
            return;
          }
          break;

        case '[img':
          meta = parseImageMeta(bbcode.slice(4, bbcode.length - 1).trim());
          if (this.processImage(bbcode, '[/img]', false, meta)) {
            return;
          }
          break;
      }

      switch (seq5) {
        case '[url=':
          match = bbcode.match(this.LINK_REGEXP);
          if (!match) { break; }
          meta = parseLinkMeta(match[1]);

          if (this.processLinkInline(bbcode, meta)) { return; }
          break;

        case '[colo':
          match = bbcode.match(this.COLOR_REGEXP);
          if (!match) { break; }

          meta = { color: match[1] };
          if (this.processMarkOpen('color', bbcode, '[/color]', meta)) {
            return;
          }
          break;

        case '[size':
          match = bbcode.match(this.SIZE_REGEXP);
          if (!match) { break; }

          meta = parseSizeMeta(match[1]);
          if (this.processMarkOpen('size', bbcode, '[/size]', meta)) {
            return;
          }
          break;
      }
    }

    this.appendInlineContent(char1);
  }

  next(steps = 1, isSkipNewLine = false) {
    this.index += steps;
    this.char1 = this.text[this.index];

    if (this.exitSequence) {
      this.isExitSequence = this.char1 === this.exitSequence[0] && (
        this.exitSequence.length === 1 ||
        this.text.slice(this.index, this.index + this.exitSequence.length) ===
          this.exitSequence
      );
    }

    if (isSkipNewLine && (this.char1 === '\n' || this.char1 === undefined)) {
      this.next();
    }
  }

  get bbcode() {
    return this.char1 === '[' ?
      extractBbCode(this.text, this.index, this.index + this.MAX_BBCODE_SIZE) :
      null;
  }

  get lastMark() {
    return this.marksStack[this.marksStack.length - 1];
  }

  get seq2() {
    return this.char1 + this.text[this.index + 1];
  }

  get seq3() {
    return this.char1 +
      this.text[this.index + 1] +
      this.text[this.index + 2];
  }

  get seq4() {
    return this.char1 +
      this.text[this.index + 1] +
      this.text[this.index + 2] +
      this.text[this.index + 3];
  }
  get seq5() {
    return this.char1 +
      this.text[this.index + 1] +
      this.text[this.index + 2] +
      this.text[this.index + 3] +
      this.text[this.index + 4];
  }

  processMarkOpen(type, openBbcode, closeBbcode, attributes) {
    if (!hasInlineSequence(this.text, closeBbcode, this.index)) { return false; }

    this.marksStack.push(this.MARK_STACK_MAPPINGS[type] || openBbcode);
    this.inlineTokens.push(
      this.tagOpen(type, attributes, openBbcode)
    );
    this.next(openBbcode.length);

    return true;
  }

  processMarkClose(type, openBbcode, closeBbcode) {
    if (this.lastMark !== openBbcode) { return false; }

    this.marksStack.pop();
    this.inlineTokens.push(
      this.tagClose(type, closeBbcode)
    );
    this.next(closeBbcode.length);

    return true;
  }

  processLinkInline(bbcode, attrs) {
    if (!hasInlineSequence(this.text, '[/url]', this.index)) { return false; }

    this.marksStack.push('[url]');
    this.inlineTokens.push(
      this.tagOpen('link_inline', attrs, bbcode)
    );
    this.next(bbcode.length);
    return true;
  }

  processImage(tagStart, tagEnd, isPoster, metaAttributes) {
    const index = this.index + tagStart.length;

    const src = extractUntil(this.text, tagEnd, index, index + 255);

    if (src) {
      this.inlineTokens.push(
        new Token(
          'image',
          null,
          null,
          {
            src,
            isPoster,
            ...(metaAttributes || {})
          }
        )
      );
      this.next(src.length + tagStart.length + tagEnd.length);
      return true;
    }

    return false;
  }

  processSmiley(char1, seq2, seq3) {
    if (char1 === ':') {
      const maxIndex = this.index + this.MAX_SMILEY_SIZE;
      const kind = extractUntilWith(this.text, ':', this.index, maxIndex);

      if (kind && kind.match(this.SMILEY_REGEXP)) {
        return this.addSmiley(kind);
      }
    }

    switch (seq2) {
      case ':)':
      case ':D':
      case ':(':
        return this.addSmiley(seq2);

      default:
        break;
    }

    switch (seq3) {
      case ':-D':
      case '+_+':
      case ':-(':
      case ':-o':
      case ':-P':
        return this.addSmiley(seq3);

      default:
        break;
    }

    return false;
  }

  processInlineBlock(startSequence, exitSequence) {
    const tokenizer = new MarkdownTokenizer(
      this.text,
      this.index + startSequence.length,
      '',
      exitSequence
    );
    const tokens = tokenizer.parse();

    if (!tokens) { return false; }
    // const endSequence =
    //   this.text.slice(tokenizer.index, tokenizer.index + exitSequence.length);
    // if (endSequence !== exitSequence) { return false; }

    this.appendInlineContent(startSequence);

    let slicedTokens;
    let isNewLineAtEnd = false;

    // append first paragraph to current inlineTokens
    if (isMatchedToken(tokens[0], 'paragraph', 'open')) {
      tokens[1].children.forEach(token => {
        if (token.type === 'text') {
          this.appendInlineContent(token.content, false);
        } else {
          this.inlineTokens.push(token);
        }
      });
      slicedTokens = tokens.slice(3);
      // close parahraph after prior content was joined
      if (slicedTokens.length) {
        this.finalizeParagraph();
      }
    } else {
      slicedTokens = tokens;
    }

    this.index = tokenizer.index;

    // insert new line at the end to maintain original formatting
    if (isMatchedToken(tokens[tokens.length - 1], 'paragraph', 'close')) {
      if (this.text[this.index - 1] === '\n') {
        isNewLineAtEnd = true;
        this.finalizeParagraph();
      }
    }

    // unwrap final paragraph
    if (!isNewLineAtEnd && slicedTokens.length &&
      isMatchedToken(slicedTokens[slicedTokens.length - 1], 'paragraph', 'close')
    ) {
      this.inlineTokens = slicedTokens[slicedTokens.length - 2].children;
      slicedTokens = slicedTokens.slice(0, slicedTokens.length - 3);
    }

    this.tokens = [...this.tokens, ...slicedTokens];

    this.appendInlineContent(exitSequence);

    return true;
  }

  processHr(bbcode) {
    this.ensureParagraphClosed();
    this.next(bbcode.length, true);
    this.push(new Token('hr', null, null, null));
  }

  processHeading(sequence, level) {
    this.paragraphToken = this.tagOpen('heading', { level });
    this.next(sequence.length);
  }

  tagOpen(type, attributes = null, bbcode) {
    return new Token(type, null, null, attributes, 'open', bbcode);
  }

  tagClose(type, bbcode) {
    return new Token(type, null, null, null, 'close', bbcode);
  }

  push(token) {
    this.tokens.push(token);
  }

  appendInlineContent(sequence, isMoveNext = true) {
    const prevToken = this.inlineTokens[this.inlineTokens.length - 1];
    if (!prevToken || prevToken.type !== 'text') {
      this.inlineTokens.push(new Token('text'));
    }
    const token = this.inlineTokens[this.inlineTokens.length - 1];
    token.content = token.content ? token.content + sequence : sequence;

    if (isMoveNext) {
      this.next(sequence.length);
    }
  }

  ensureParagraphClosed() {
    if (this.inlineTokens.length) {
      this.finalizeParagraph();
    }
  }

  finalizeParagraph() {
    if (!this.nestedSequence || this.inlineTokens.length) {
      if (!this.paragraphToken) {
        this.paragraphToken = this.tagOpen('paragraph');
      }

      this.push(this.paragraphToken);
      this.push(
        new Token('inline', null, rollbackUnbalancedTokens(this.inlineTokens))
      );
      this.push(this.tagClose(this.paragraphToken.type));
    }

    this.inlineTokens = [];
    this.marksStack = [];
    this.paragraphToken = null;
  }

  addSmiley(kind) {
    this.inlineTokens.push(
      new Token('smiley', null, null, { kind })
    );
    this.next(kind.length);
    return true;
  }

  isSequenceContinued() {
    const sequenceSlice = this.text.slice(
      this.index,
      this.index + this.nestedSequence.length
    );

    return sequenceSlice === this.nestedSequence;
  }

  isSkippableSequence(skipSequence) {
    return skipSequence &&
      this.text[this.index] === skipSequence[0] &&
      this.text.slice(this.index, this.index + skipSequence.length) ===
        skipSequence;
  }

  isOnlyInlineSpacingsBefore() {
    return this.inlineTokens.length == 1 &&
      this.inlineTokens[0].type === 'text' &&
      !!this.inlineTokens[0].content.match(this.EMPTY_SPACES_REGEXP);
  }
}
