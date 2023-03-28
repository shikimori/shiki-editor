import { expect } from 'chai';
import SwapMispositionedTags from '../../../src/markdown/tokenizer/swap_mispositioned_tags';

describe('SwapMispositionedTags', () => {
  // describe('no replacement required', () => {
  //   [
  //     '',
  //     'a',
  //     'z[b]x[/b]c',
  //     'z[b][i]x[/i][/b]c'
  //   ].forEach(text => {
  //     it(text, () => {
  //       expect(SwapMispositionedTags.parse(text)).to.eql(text);
  //     });
  //   });
  // });

  it('z[b][i]x[/b][/i]c', () => {
    expect(SwapMispositionedTags.parse('z[b][i]x[/b][/i]c')).to.eql(
      'z[b][i]x[/i][/b]c'
    );
  });

  // describe('code block', () => {
  //   [
  //     '[code]z[b][i]x[/b][/i]c[/code]',
  //     '```\nz[b][i]x[/b][/i]c```'
  //   ].forEach(text => {
  //     it(text, () => {
  //       expect(SwapMispositionedTags.parse(text)).to.eql(text);
  //     });
  //   });
  // });

  // it('z[b][i][u]x[/b][/u][/i]c', () => {
  //   expect(SwapMispositionedTags.parse('z[b][i][u]x[/b][/u][/i]c')).to.eql(
  //     'z[b][i][u]x[/b][/u][/i]c'
  //   );
  // });
});
