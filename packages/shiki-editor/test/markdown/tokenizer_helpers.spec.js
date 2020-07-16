import { expect } from 'chai';
import {
  extractBbCode,
  extractUntil,
  extractUntilWith,
  hasInlineSequence,
  extractMarkdownLanguage,
  isMatchedToken,
  rollbackUnbalancedTokens
} from '../../src/markdown/tokenizer_helpers';

describe('tokenizer_helpers', () => {
  it('extractBbCode', () => {
    expect(extractBbCode('test[zxc]qwe', 4)).to.eq('[zxc]');
    expect(extractBbCode('test[z[b]x[/b]c]qwe', 4)).to.eq('[z[b]x[/b]c]');
    expect(extractBbCode('test[zxc]qwe', 1)).to.eq(null);

    expect(extractBbCode('test[zxcqwe', 1)).to.eq(null);

    expect(extractBbCode('test[zxc\n]qwe', 1)).to.eq(null);
  });

  it('extractUntil', () => {
    expect(extractUntil('te1st', '1', 0)).to.eq('te');
    expect(extractUntil('te1st', '1', 1)).to.eq('e');
    expect(extractUntil('te1st', '1', 2)).to.eq(null);

    expect(extractUntil('te1st', 'st', 0)).to.eq('te1');

    expect(extractUntil('te1\nst', 'st', 0)).to.eq(null);
    expect(extractUntil('te1\nst2', '2', 0, null, true)).to.eq('te1\nst');

    expect(extractUntil('te1st', '1', 0, 99)).to.eq('te');
    expect(extractUntil('te1st', '1', 0, 1)).to.eq(null);
  });

  it('extractUntilWith', () => {
    expect(extractUntilWith('te1st', '1', 0)).to.eq('te1');
    expect(extractUntilWith('te1st', '1', 1)).to.eq('e1');
    expect(extractUntilWith('te1st', '1', 2)).to.eq(null);

    expect(extractUntilWith('te1stz', 'st', 0)).to.eq('te1st');

    expect(extractUntilWith('te1\nst', 'st', 0)).to.eq(null);
    expect(extractUntilWith('te1\nst2z', '2', 0, null, true)).to.eq('te1\nst2');

    expect(extractUntilWith('te1st', '1', 0, 99)).to.eq('te1');
    expect(extractUntilWith('te1st', '1', 0, 1)).to.eq(null);
  });

  it('hasInlineSequence', () => {
    expect(hasInlineSequence('te1st', '1', 0)).to.eq(true);
    expect(hasInlineSequence('te1st', '1', 1)).to.eq(true);
    expect(hasInlineSequence('te1st', '1', 2)).to.eq(false);

    expect(hasInlineSequence('te1st', 'st', 0)).to.eq(true);

    expect(hasInlineSequence('te1\nst', 'st', 0)).to.eq(false);

    expect(hasInlineSequence('te1st', '1', 0, 99)).to.eq(true);
    expect(hasInlineSequence('te1st', '1', 0, 1)).to.eq(false);
  });

  it('extractMarkdownLanguage', () => {
    expect(extractMarkdownLanguage('test', 0)).to.eq('test');
    expect(extractMarkdownLanguage('```\n', 3)).to.eq('');
    expect(extractMarkdownLanguage('```test', 3)).to.eq('test');
    expect(extractMarkdownLanguage('```test\n', 3)).to.eq('test');
  });

  it('isMatchedToken', () => {
    expect(isMatchedToken({ type: 'bold', direction: 'open' }, 'bold', 'open'))
      .to.eq(true);

    expect(isMatchedToken(null, 'bold', 'open'))
      .to.eq(false);

    expect(isMatchedToken({ type: 'bold', direction: 'open' }, 'size', 'open'))
      .to.eq(false);
    expect(isMatchedToken({ type: 'bold', direction: 'open' }, 'bold', 'close'))
      .to.eq(false);

    expect(isMatchedToken({ type: 'size', direction: 'open' }, 'bold', 'open'))
      .to.eq(false);
    expect(isMatchedToken({ type: 'bold', direction: 'close' }, 'bold', 'open'))
      .to.eq(false);
  });

  it('rollbackUnbalancedTokens', () => {
    expect(rollbackUnbalancedTokens([
      { type: 'bold', direction: 'open', bbcode: '[b]' },
      { type: 'text', content: 'zxc' },
      { type: 'bold', direction: 'close' }
    ])).to.eql([
      { type: 'bold', direction: 'open', bbcode: '[b]' },
      { type: 'text', content: 'zxc' },
      { type: 'bold', direction: 'close' }
    ]);

    expect(rollbackUnbalancedTokens([
      { type: 'bold', direction: 'open', bbcode: '[b]' },
      { type: 'text', content: 'zxc' }
    ])).to.eql([
      { type: 'text', content: '[b]' },
      { type: 'text', content: 'zxc' }
    ]);

    expect(rollbackUnbalancedTokens([
      { type: 'bold', direction: 'close', bbcode: '[/b]' },
      { type: 'text', content: 'zxc' }
    ])).to.eql([
      { type: 'text', content: '[/b]' },
      { type: 'text', content: 'zxc' }
    ]);

    expect(rollbackUnbalancedTokens([
      { type: 'bold', direction: 'open', bbcode: '[b]' },
      { type: 'bold', direction: 'open', bbcode: '[b]' },
      { type: 'text', content: 'zxc' },
      { type: 'bold', direction: 'close' }
    ])).to.eql([
      { type: 'bold', direction: 'open', bbcode: '[b]' },
      { type: 'text', content: '[b]' },
      { type: 'text', content: 'zxc' },
      { type: 'bold', direction: 'close' }
    ]);
  });
});
