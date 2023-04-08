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

  // describe('code block', () => {
  //   [
  //     '[code]z[b][i]x[/b][/i]c[/code]',
  //     '```\nz[b][i]x[/b][/i]c```'
  //   ].forEach(text => {
  //     it(text, () => {
  //       expect(swapMispositionedTags(text)).to.eql(text);
  //     });
  //   });
  // });

  // it('z[b][i][u]x[/b][/u][/i]c', () => {
  //   expect(swapMispositionedTags('z[b][i][u]x[/b][/u][/i]c')).to.eql(
  //     'z[b][i][u]x[/b][/u][/i]c'
  //   );
  // });
});
