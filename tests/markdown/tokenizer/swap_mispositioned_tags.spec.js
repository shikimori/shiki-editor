import { expect } from 'chai';
import swapMispositionedTags from '../../../src/markdown/tokenizer/swap_mispositioned_tags';

describe('swapMispositionedTags', () => {
  describe('no replacement required', () => {
    [
      '',
      'a',
      'z[b]x[/b]c',
      'z[b][i]x[/i][/b]c',
      'z[b][i]x',
      '[b][i]a[/b][/u]',
      '[b][i]a[/b] [/i]'
    ].forEach(text => {
      it(text, () => {
        expect(swapMispositionedTags(text)).to.eql(text);
      });
    });
  });

  describe('replacement required', () => {
    [
      ['[b][i]a[/b][/i]', '[b][i]a[/i][/b]'],
      ['[b][size=30]a[/b][/size]', '[b][size=30]a[/size][/b]'],
      ['z[b][i]x[/b][/i]c', 'z[b][i]x[/i][/b]c'],
      [
        'z[quote][b][u][i]x[/quote][/b][/i][/u]c',
        'z[quote][b][u][i]x[/i][/u][/b][/quote]c'
      ],
      [
        '[b][i]a[/b][/i] [b][i]a[/b][/i]',
        '[b][i]a[/i][/b] [b][i]a[/i][/b]'
      ],
      ['[b][i][anime=123][/b][/i]', '[b][i][anime=123][/i][/b]']
    ].forEach(([text, replacement]) => {
      it(text, () => {
        expect(swapMispositionedTags(text)).to.eql(replacement);
      });
    });
  });

  describe('code inline and clode blocks', () => {
    [
      '`z[b][i]x[/b][/i]c`',
      // '[code]z[b][i]x[/b][/i]c[/code]',
      // '```\nz[b][i]x[/b][/i]c\n```'
    ].forEach(text => {
      it(text, () => {
        expect(swapMispositionedTags(text)).to.eql(text);
      });
    });

    describe('parser rolls back when code block is unclosed', () => {
      [
        ['`a[b][i]b[/b][/i]c', '`a[b][i]b[/i][/b]c'],
        ['`a[b][i]b[/b][/i]c\n`', '`a[b][i]b[/i][/b]c\n`'],
        // ['[code]a[b][i]b[/b][/i]c', '[code]a[b][i]b[/i][/b]c'],
        // ['```\na[b][i]b[/b][/i]c```', '```\na[b][i]b[/i][/b]c```'],
        // ['```\na[b][i]b[/b][/i]c', '```\na[b][i]b[/i][/b]c']
      ].forEach(([text, replacement]) => {
        it(text, () => {
          expect(swapMispositionedTags(text)).to.eql(replacement);
        });
      });
    });
  });
});
