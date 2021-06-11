import Token from './token';

import {
  extractBbCode,
  rollbackUnbalancedTokens,
  isPriorParagraphEndedWithHardBreak
} from './helpers';

import {
  parseCodeMeta,
  parseDivMeta,
  parseLinkMeta,
  parseQuoteMeta,
  parseShikiBasicMeta,
  parseShikiImageMeta,
  parseSizeMeta,
  parseSpoilerMeta,
  LIST_DEPRECATION_TEXT
} from './bbcode_helpers';

import processBlock from './processors/block';
import processBlockQuote from './processors/block_quote';
import processBulletList from './processors/bullet_list';
import processCodeBlock from './processors/code_block';
import processCodeInline from './processors/code_inline';
import processHeading from './processors/heading';
import processHr from './processors/hr';
import processImage from './processors/image';
import processVideo from './processors/video';
import processInlineBlock from './processors/inline_block';
import processLinkInline from './processors/link_inline';
import { processInlineOrBlock } from './processors/inline_or_block';
import processMarkOpen from './processors/mark_open';
import processMarkClose from './processors/mark_close';
import { processShikiInline } from './processors/shiki_inline';
import processShikiBlock from './processors/shiki_block';
import processSmiley from './processors/smiley';

export default class MarkdownTokenizer {
  MAX_BBCODE_SIZE = 512
  MAX_NESTING = 4

  SPOILER_BBCODE_REGEXP = /^\[(spoiler|spoiler_block)(?:=(.+?))?((?:(?: is-fullwidth)|(?: is-centered))*)\]$/
  BLOCK_BBCODE_REGEXP = /^\[(quote|spoiler|spoiler_block|code)(?:=(.+?))?\]$/
  DIV_REGEXP = /^\[div(?:(?:=| )([^\]]+))?\]$/
  SPAN_REGEXP = /^\[span(?:(?:=| )([^\]]+))?\]$/
  COLOR_REGEXP = /^\[color=(#[\da-fA-F]+|\w+)\]$/
  SIZE_REGEXP = /^\[size=(\d+)\]$/
  LINK_REGEXP = /^\[url=(.+?)\]$/
  EMPTY_SPACES_REGEXP = /^ +$/

  MARK_STACK_MAPPINGS = {
    color_inline: '[color]',
    size_inline: '[size]',
    link_inline: '[url]',
    span: '[span]'
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
    this.skippableSequences = [];
    this.paragraphToken = null;
  }

  static parse(text) {
    // console.log(new MarkdownTokenizer(text, 0).parse());
    return new MarkdownTokenizer(text, 0).parse();
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
        // add aditional parahraph when meet \n before exitSequence
        // if (this.isExitSequence) { this.finalizeParagraph(); }
        return;
      }

      if (isStart) {
        switch (seq5) {
          case '#### ':
            processHeading(this, seq5, 4);
            return;

          case '#####':
            if (this.text[this.index + 5] === ' ') {
              processHeading(this, seq5 + ' ', 5);
              return;
            }
        }

        switch (seq4) {
          case '### ':
            processHeading(this, seq4, 3);
            return;
        }

        switch (seq3) {
          case '```':
            if (processCodeBlock(this, seq3, '\n```', null, true)) {
              break outer;
            }
            break;

          case '## ':
            processHeading(this, seq3, 2);
            return;
        }

        switch (seq2) {
          case '>?':
          case '> ':
            if (processBlockQuote(this, seq2)) {
              break outer;
            }
            break;

          case '- ':
          case '+ ':
          case '* ':
            processBulletList(this, seq2);
            break outer;

          case '# ':
            processHeading(this, seq2, 1);
            return;
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

          case '[list]':
            meta = {
              data: [['data-deperecation', LIST_DEPRECATION_TEXT]]
            };
            isProcessed = processBlock(
              this,
              'div', bbcode, '[/list]', meta,
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed) { return; }
            break;
        }
      }

      if (bbcode && (isStart || isOnlySpacingsBefore)) {
        switch (seq4) {
          case '[div':
            match = bbcode.match(this.DIV_REGEXP);
            if (!match) { break; }

            isProcessed = processBlock(
              this,
              'div', bbcode, '[/div]', parseDivMeta(match[1]),
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed) { return; }
            break;

          case '[url':
            match = bbcode.match(this.LINK_REGEXP);
            if (!match) { break; }

            isProcessed = processInlineOrBlock(
              this,
              'link', bbcode, '[/url]', parseLinkMeta(match[1]),
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed === true) { return; }
            if (isProcessed === false) { continue; }
            break;
        }

        switch (seq5) {
          case '[spoi':
            match = bbcode.match(this.SPOILER_BBCODE_REGEXP);
            if (!match) { break; }

            meta = parseSpoilerMeta(match[2], match[3]);
            // ignore common spoilers with bbcodes
            if (match[1] === 'spoiler' && meta?.label?.match(/\[\w+/)) {
              break;
            }

            isProcessed = processBlock(
              this,
              'spoiler_block', bbcode, `[/${match[1]}]`, meta,
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed) { return; }
            break;

          case '[size':
            match = bbcode.match(this.SIZE_REGEXP);
            if (!match) { break; }

            isProcessed = processInlineOrBlock(
              this,
              'size', bbcode, '[/size]', parseSizeMeta(match[1]),
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed === true) { return; }
            if (isProcessed === false) { continue; }
            break;

          case '[colo':
            match = bbcode.match(this.COLOR_REGEXP);
            if (!match) { break; }

            isProcessed = processInlineOrBlock(
              this,
              'color', bbcode, '[/color]', { color: match[1] },
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed === true) { return; }
            if (isProcessed === false) { continue; }
            break;

          case '[anim':
          case '[mang':
          case '[rano':
          case '[char':
          case '[pers':
          case '[comm':
          case '[topi':
          case '[entr':
          case '[mess':
          case '[user':
            meta = parseShikiBasicMeta(bbcode);
            if (!meta) { break; }

            if (processShikiBlock(this, bbcode, `[/${meta.type}]`, meta)) { return; }
            break;
        }
      }

      if (bbcode) {
        switch (bbcode) {
          case '[center]':
            isProcessed = processBlock(
              this,
              'center', bbcode, '[/center]', null,
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed) { return; }
            break;

          case '[right]':
            isProcessed = processBlock(
              this,
              'right', bbcode, '[/right]', null,
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed) { return; }
            break;

          case '[b]':
            isProcessed = processInlineOrBlock(
              this,
              'bold', bbcode, '[/b]', null,
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed === true) { return; }
            if (isProcessed === false) { continue; }
            break;

          case '[i]':
            isProcessed = processInlineOrBlock(
              this,
              'italic', bbcode, '[/i]', null,
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed === true) { return; }
            if (isProcessed === false) { continue; }
            break;
        }

        if (seq5 === '[code' && (match = bbcode.match(this.BLOCK_BBCODE_REGEXP))) {
          const meta = parseCodeMeta(match[2]);
          if (isStart || meta) {
            isProcessed = processCodeBlock(
              this,
              bbcode, `[/${match[1]}]`, meta,
              isStart, isOnlySpacingsBefore
            );
            if (isProcessed) { return; }
          }
        }

        if (seq5 === '[quot' && (match = bbcode.match(this.BLOCK_BBCODE_REGEXP))) {
          isProcessed = processBlock(
            this,
            'quote', bbcode, `[/${match[1]}]`, parseQuoteMeta(match[2]),
            isStart, isOnlySpacingsBefore
          );
          if (isProcessed) { return; }
        }
      }

      const parseInlineResult =
        this.parseInline(char1, bbcode, seq2, seq3, seq4, seq5, isOnlySpacingsBefore);

      switch (parseInlineResult) {
        case true: // it means that it was parsed as a block
          return;
        case false: // it means that it was parsed as an inline
          continue;
      }

      this.appendInlineContent(char1);
    }
  }

  parseInline(char1, bbcode, seq2, seq3, seq4, seq5, isOnlySpacingsBefore) {
    switch (bbcode) {
      case '[b]':
        if (processMarkOpen(this, 'bold_inline', '[b]', '[/b]')) return false;
        break;

      case '[/b]':
        if (processMarkClose(this, 'bold_inline', '[b]', '[/b]')) return false;
        break;

      case '[i]':
        if (processMarkOpen(this, 'italic_inline', '[i]', '[/i]')) return false;
        break;

      case '[/i]':
        if (processMarkClose(this, 'italic_inline', '[i]', '[/i]')) return false;
        break;

      case '[u]':
        if (processMarkOpen(this, 'underline', '[u]', '[/u]')) { return false; }
        break;

      case '[/u]':
        if (processMarkClose(this, 'underline', '[u]', '[/u]')) return false;
        break;

      case '[s]':
        if (processMarkOpen(this, 'strike', '[s]', '[/s]')) { return false; }
        break;

      case '[/s]':
        if (processMarkClose(this, 'strike', '[s]', '[/s]')) { return false; }
        break;

      case '[url]':
        if (processLinkInline(this, bbcode)) { return false; }
        break;

      case '[/url]':
        if (processMarkClose(this, 'link_inline', '[url]', '[/url]')) {
          return false;
        }
        break;

      case '[/span]':
        if (processMarkClose(this, 'span', '[span]', '[/span]')) {
          return false;
        }
        break;

      case '[/color]':
        if (processMarkClose(this, 'color_inline', '[color]', '[/color]')) {
          return false;
        }
        break;

      case '[/spoiler]':
        if (this.skippableSequences[this.skippableSequences.length - 1] === '[/spoiler]') {
          this.skippableSequences.pop();
          return;
        }
        break;

      case '[/size]':
        if (processMarkClose(this, 'size_inline', '[size]', '[/size]')) {
          return false;
        }
        break;

      case '[poster]':
        if (processImage(this, bbcode, '[/poster]', true)) { return false; }
        break;

      case '[code]':
        if (processCodeInline(this, bbcode, '[/code]')) { return false; }
        break;

      case '[hr]':
        processHr(this, bbcode);
        return true;

      case '[br]':
        this.next(bbcode.length);
        this.finalizeParagraph(true);
        return true;
    }

    if (seq2 === '||' && seq3 !== '|||') {
      if (this.lastMark !== seq2) {
        if (processMarkOpen(this, 'spoiler_inline', '||', '||')) { return false; }
      } else if (processMarkClose(this, 'spoiler_inline', '||', '||')) { return false; }
    }

    if (char1 === '`') {
      if (processCodeInline(this, char1)) { return false; }
    }

    if (char1 === ':' || char1 === '+') {
      if (processSmiley(this, char1, seq2, seq3)) { return false; }
    }

    let match;
    let meta;
    let isProcessed;

    if (bbcode) {
      switch (seq4) {
        case '[div':
          isProcessed = processInlineBlock(this, bbcode, '[/div]');
          if (isProcessed) { return false; }
          break;

        case '[img':
          isProcessed = processImage(this, bbcode, '[/img]', false);
          if (isProcessed) { return false; }
          break;
      }

      switch (seq5) {
        case '[url=':
          match = bbcode.match(this.LINK_REGEXP);
          if (!match) { break; }
          meta = parseLinkMeta(match[1]);
          isProcessed = processLinkInline(this, bbcode, meta);

          if (isProcessed) { return false; }
          break;

        case '[span':
          match = bbcode.match(this.SPAN_REGEXP);
          if (!match) { break; }
          meta = parseDivMeta(match[1]);
          isProcessed = processMarkOpen(this, 'span', bbcode, '[/span]', meta);

          if (isProcessed) { return false; }
          break;

        case '[colo':
          match = bbcode.match(this.COLOR_REGEXP);
          if (!match) { break; }

          meta = { color: match[1] };
          isProcessed =
            processMarkOpen(this, 'color_inline', bbcode, '[/color]', meta);
          if (isProcessed) { return false; }
          break;

        case '[size':
          match = bbcode.match(this.SIZE_REGEXP);
          if (!match) { break; }

          meta = parseSizeMeta(match[1]);
          isProcessed =
            processMarkOpen(this, 'size_inline', bbcode, '[/size]', meta);
          if (isProcessed) { return false; }
          break;

        case '[vide':
          isProcessed = processVideo(this, bbcode, '[/video]');
          if (isProcessed) { return false; }
          break;

        case '[anim':
        case '[mang':
        case '[rano':
        case '[char':
        case '[pers':
        case '[comm':
        case '[topi':
        case '[entr':
        case '[mess':
        case '[user':
          meta = parseShikiBasicMeta(bbcode);
          if (!meta) { break; }

          isProcessed =
            processShikiInline(this, bbcode, `[/${meta.type}]`, meta);

          if (isProcessed) { return false; }
          break;

        case '[post':
        case '[imag':
          meta = parseShikiImageMeta(bbcode);
          if (!meta) { break; }

          if (processShikiInline(this, bbcode, null, meta)) { return false; }
          break;

        case '[spoi':
          match = bbcode.match(this.SPOILER_BBCODE_REGEXP);
          if (!match) { break; }
          if (match[1] === 'spoiler') {
            this.skippableSequences.push('[/spoiler]');
            break;
          }

          meta = parseSpoilerMeta(match[2], match[3]);
          isProcessed = processBlock(
            this,
            'spoiler_block', bbcode, `[/${match[1]}]`, meta,
            false, isOnlySpacingsBefore
          );

          if (isProcessed) { return true; }
          break;
      }
    }

    return undefined;
  }

  next(steps = 1, isSkipNewLine = false) {
    this.index += steps;
    this.char1 = this.text[this.index];

    if (this.exitSequence === '\n') {
      this.isExitSequence = this.char1 === '\n' || this.char1 === undefined;

    } else if (this.exitSequence) {
      this.isExitSequence = this.isMatchedExitSequence();
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

  finalizeParagraph(isHardBreak) {
    if (this.inlineTokens.length || !this.nestedSequence || (
      this.nestedSequence && this.isSequenceContinued(1)
    )) {
      if (!this.paragraphToken) {
        this.paragraphToken = this.tagOpen('paragraph');
      }
      if (isHardBreak) {
        this.paragraphToken.attrSet('isHardBreak', true);
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

  isSequenceContinued(offset = 0) {
    const sequenceSlice = this.text.slice(
      this.index + offset,
      this.index + offset + this.nestedSequence.length
    );

    return sequenceSlice === this.nestedSequence ||
      isPriorParagraphEndedWithHardBreak(this.tokens);
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

  isExceededNesting() {
    if (!this.tokens.length) { return false; }

    let nesting = 0;

    for (let i = this.tokens.length - 1; i >= 0; i -= 1) {
      const { type, direction } = this.tokens[i];

      if (type === 'blockquote' || type === 'bullet_list' || type === 'quote') {
        nesting += direction === 'open' ? 1 : -1;
      }

      if (nesting >= this.MAX_NESTING) {
        return true;
      }
    }

    return false;
  }

  isMatchedExitSequence() {
    const { char1, exitSequence, skippableSequences, text, index } = this;

    if (char1 !== exitSequence[0]) { return false; }
    if (exitSequence.length === 1) { return true; }

    const sequence = text.slice(index, index + exitSequence.length);

    if (skippableSequences[skippableSequences.length - 1] === sequence) {
      return false;
    }

    return sequence === exitSequence;
  }
}
