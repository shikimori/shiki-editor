import Token from './token';

import {
  extractBbCode,
  rollbackUnbalancedTokens
} from './helpers';

import {
  parseCodeMeta,
  parseDivMeta,
  parseImageMeta,
  parseLinkMeta,
  parseQuoteMeta,
  parseShikiBasicMeta,
  parseSizeMeta,
  parseSpoilerMeta,
} from './bbcode_helpers';

import processBlock from './processors/block';
import processBlockQuote from './processors/block_quote';
import processBulletList from './processors/bulle_list';
import processCodeBlock from './processors/code_block';
import processCodeInline from './processors/code_inline';
import processHeading from './processors/heading';
import processHr from './processors/hr';
import processImage from './processors/image';
import processInlineBlock from './processors/inline_block';
import processLinkInline from './processors/link_inline';
import processPseudoBlock from './processors/pseudo_block';
import processSmiley from './processors/smiley';
import { processMarkOpen, processMarkClose } from './processors/mark';
import processShikiInline from './processors/shiki_inline';

export default class MarkdownTokenizer {
  MAX_BBCODE_SIZE = 512

  BLOCK_BBCODE_REGEXP = /^\[(?:quote|spoiler|code)(?:=(.+?))?\]$/
  DIV_REGEXP = /^\[div(?:(?:=| )([^\]]+))?\]$/
  COLOR_REGEXP = /^\[color=(#[\da-f]+|\w+)\]$/
  SIZE_REGEXP = /^\[size=(\d+)\]$/
  LINK_REGEXP = /^\[url=(.+?)\]$/
  EMPTY_SPACES_REGEXP = /^ +$/

  SHIKI_LINK_REGEXP = /^\[(anime|manga|ranobe|character|person)=(\d+)\]$/
  SHIKI_IMAGE_REGEXP = /^\[(poster|image)=(\d+)(?: ([^\]]+))?\]$/

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
            processHeading(this, seq5, 4);
            break outer;

          case '#####':
            if (this.text[this.index + 5] === ' ') {
              processHeading(this, seq5 + ' ', 5);
              break outer;
            }
        }

        switch (seq4) {
          case '### ':
            processHeading(this, seq4, 3);
            break outer;
        }

        switch (seq3) {
          case '```':
            if (processCodeBlock(this, seq3, '\n```', null, true)) {
              break outer;
            }
            break;

          case '## ':
            processHeading(this, seq3, 2);
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
            processHeading(this, seq2, 1);
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

      if (this.parseInline(char1, bbcode, seq2, seq3, seq4, seq5)) {
        break;
      }
    }
  }

  parseInline(char1, bbcode, seq2, seq3, seq4, seq5) {
    switch (bbcode) {
      case '[b]':
        if (processMarkOpen(this, 'bold', '[b]', '[/b]')) { return; }
        break;

      case '[/b]':
        if (processMarkClose(this, 'bold', '[b]', '[/b]')) { return; }
        break;

      case '[i]':
        if (processMarkOpen(this, 'italic', '[i]', '[/i]')) { return; }
        break;

      case '[/i]':
        if (processMarkClose(this, 'italic', '[i]', '[/i]')) { return; }
        break;

      case '[u]':
        if (processMarkOpen(this, 'underline', '[u]', '[/u]')) { return; }
        break;

      case '[/u]':
        if (processMarkClose(this, 'underline', '[u]', '[/u]')) { return; }
        break;

      case '[s]':
        if (processMarkOpen(this, 'strike', '[s]', '[/s]')) { return; }
        break;

      case '[/s]':
        if (processMarkClose(this, 'strike', '[s]', '[/s]')) { return; }
        break;

      case '[/url]':
        if (processMarkClose(this, 'link_inline', '[url]', '[/url]')) { return; }
        break;

      case '[/color]':
        if (processMarkClose(this, 'color', '[color]', '[/color]')) { return; }
        break;

      case '[/size]':
        if (processMarkClose(this, 'size', '[size]', '[/size]')) { return; }
        break;

      case '[poster]':
        if (processImage(this, bbcode, '[/poster]', true)) { return; }
        break;

      case '[code]':
        if (processCodeInline(this, bbcode, '[/code]')) { return; }
        break;

      case '[hr]':
        processHr(this, bbcode);
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
        if (processMarkOpen(this, 'spoiler_inline', '||', '||')) { return; }
      } else if (processMarkClose(this, 'spoiler_inline', '||', '||')) { return; }
    }

    if (char1 === '`') {
      if (processCodeInline(this, char1)) { return; }
    }

    if (char1 === ':' || char1 === '+') {
      if (processSmiley(this, char1, seq2, seq3)) { return; }
    }

    let match;
    let meta;

    if (bbcode) {
      switch (seq4) {
        case '[div':
          if (processInlineBlock(this, bbcode, '[/div]')) { return; }
          break;

        case '[img':
          if (processImage(this, bbcode, '[/img]', false)) { return; }
          break;
      }

      switch (seq5) {
        case '[url=':
          match = bbcode.match(this.LINK_REGEXP);
          if (!match) { break; }
          meta = parseLinkMeta(match[1]);

          if (processLinkInline(this, bbcode, meta)) { return; }
          break;

        case '[colo':
          match = bbcode.match(this.COLOR_REGEXP);
          if (!match) { break; }

          meta = { color: match[1] };
          if (processMarkOpen(this, 'color', bbcode, '[/color]', meta)) {
            return;
          }
          break;

        case '[size':
          match = bbcode.match(this.SIZE_REGEXP);
          if (!match) { break; }

          meta = parseSizeMeta(match[1]);
          if (processMarkOpen(this, 'size', bbcode, '[/size]', meta)) {
            return;
          }
          break;

        case '[anim':
        case '[mang':
        case '[rano':
        case '[char':
        case '[pers':
          match = bbcode.match(this.SHIKI_LINK_REGEXP);
          if (!match) { break; }
          meta = parseShikiBasicMeta(match[1], match[2]);

          if (processShikiInline(this, bbcode, `[/${meta.type}]`, meta)) {
            return;
          }
          break;

        case '[post':
        case '[imag':
          match = bbcode.match(this.SHIKI_IMAGE_REGEXP);
          if (!match) { break; }

          let imageMeta; // eslint-disable-line
          if (match[3]) {
            imageMeta = parseImageMeta(match[3]);
            if (!imageMeta) { break; }
          }
          meta = parseShikiBasicMeta(match[1], match[2], imageMeta);

          if (processShikiInline(this, bbcode, null, meta)) { return; }
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
