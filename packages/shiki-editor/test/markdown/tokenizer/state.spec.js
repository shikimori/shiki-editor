import { expect } from 'chai';
import { MarkdownTokenizer } from '../../../src/markdown';

function text(content) {
  return [
    { type: 'paragraph', direction: 'open' },
    { type: 'inline', children: [{ type: 'text', content }] },
    { type: 'paragraph', direction: 'close' }
  ];
}
function n(
  nBeforeOpen = false,
  nAfterOpen = false,
  nBeforeClose = false,
  nAfterClose = false
) {
  return Object.entries({
    nBeforeOpen: !!nBeforeOpen,
    nAfterOpen: !!nAfterOpen,
    nBeforeClose: !!nBeforeClose,
    nAfterClose: !!nAfterClose
  });
}

describe('MarkdownTokenizer', () => {
  it('<empty>', () => {
    expect(MarkdownTokenizer.parse('')).to.eql([]);
  });

  describe('parahraphs', () => {
    it('z', () => {
      expect(MarkdownTokenizer.parse('z')).to.eql([
        ...text('z')
      ]);
    });

    it('zzz', () => {
      expect(MarkdownTokenizer.parse('zzz')).to.eql([
        ...text('zzz')
      ]);
    });

    it('zzz\\nxxx', () => {
      expect(MarkdownTokenizer.parse('zzz\nxxx')).to.eql([
        ...text('zzz'),
        ...text('xxx')
      ]);
    });

    it('\\n', () => {
      expect(MarkdownTokenizer.parse('\n')).to.eql([
        { type: 'paragraph', direction: 'open' },
        { type: 'inline', children: [] },
        { type: 'paragraph', direction: 'close' }
      ]);
    });

    it('[br]', () => {
      expect(MarkdownTokenizer.parse('qwe[br]zxc')).to.eql([
        ...text('qwe'),
        ...text('zxc')
      ]);
    });
  });

  describe('marks', () => {
    describe('bold', () => {
      it('[b]zxc[/b]', () => {
        expect(MarkdownTokenizer.parse('[b]zxc[/b]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'bold_inline', direction: 'open', bbcode: '[b]' },
              { type: 'text', content: 'zxc' },
              { type: 'bold_inline', direction: 'close', bbcode: '[/b]' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[b]z', () => {
        expect(MarkdownTokenizer.parse('[b]z')).to.eql([
          ...text('[b]z')
        ]);
      });

      it('z[/b]', () => {
        expect(MarkdownTokenizer.parse('z[/b]')).to.eql([
          ...text('z[/b]')
        ]);
      });

      // it('**zxc**', () => {
      //   expect(MarkdownTokenizer.parse('**zxc**')).to.eql([{
      //     type: 'paragraph', direction: 'open'
      //   }, {
      //     type: 'inline',
      //     children: [{
      //       type: 'bold_inline', direction: 'open'
      //     }, {
      //       content: 'zxc',
      //       type: 'text'
      //     }, {
      //       type: 'bold_inline', direction: 'close', bbcode: '[/b]'
      //     }]
      //   }, {
      //     type: 'paragraph', direction: 'close'
      //   }]);
      // });
      //
      // it('**z', () => {
      //   expect(MarkdownTokenizer.parse('**z')).to.eql([
      //     ...text('**z')
      //   ]);
      // });
      //
      // it('z**', () => {
      //   expect(MarkdownTokenizer.parse('z**')).to.eql([
      //     ...text('z**')
      //   ]);
      // });

      it('a[b]zxc[/b]A', () => {
        expect(MarkdownTokenizer.parse('a[b]zxc[/b]A')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'text', content: 'a' },
              { type: 'bold_inline', direction: 'open', bbcode: '[b]' },
              { type: 'text', content: 'zxc' },
              { type: 'bold_inline', direction: 'close', bbcode: '[/b]' },
              { type: 'text', content: 'A' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });
    });

    describe('italic', () => {
      it('[i]zxc[/i]', () => {
        expect(MarkdownTokenizer.parse('[i]zxc[/i]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'italic_inline', direction: 'open', bbcode: '[i]' },
              { type: 'text', content: 'zxc' },
              { type: 'italic_inline', direction: 'close', bbcode: '[/i]' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('z[/i]', () => {
        expect(MarkdownTokenizer.parse('z[/i]')).to.eql([
          ...text('z[/i]')
        ]);
      });

      // it('*zxc*', () => {
      //   expect(MarkdownTokenizer.parse('*zxc*')).to.eql([{
      //     type: 'paragraph', direction: 'open'
      //   }, {
      //     type: 'inline',
      //     children: [{
      //       type: 'em', direction: 'open'
      //     }, {
      //       content: 'zxc',
      //       type: 'text'
      //     }, {
      //       type: 'em', direction: 'close'
      //     }]
      //   }, {
      //     type: 'paragraph', direction: 'close'
      //   }]);
      // });
    });

    describe('underline', () => {
      it('[u]zxc[/u]', () => {
        expect(MarkdownTokenizer.parse('[u]zxc[/u]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'underline', direction: 'open', bbcode: '[u]' },
              { type: 'text', content: 'zxc' },
              { type: 'underline', direction: 'close', bbcode: '[/u]' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('z[/u]', () => {
        expect(MarkdownTokenizer.parse('z[/u]')).to.eql([
          ...text('z[/u]')
        ]);
      });
    });

    describe('strike', () => {
      it('[s]zxc[/s]', () => {
        expect(MarkdownTokenizer.parse('[s]zxc[/s]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'strike', direction: 'open', bbcode: '[s]' },
              { type: 'text', content: 'zxc' },
              { type: 'strike', direction: 'close', bbcode: '[/s]' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('z[/s]', () => {
        expect(MarkdownTokenizer.parse('z[/s]')).to.eql([
          ...text('z[/s]')
        ]);
      });
    });

    describe('inline_code', () => {
      it('`zxc`', () => {
        expect(MarkdownTokenizer.parse('`zxc`')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'code_inline', content: 'zxc' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('qwe [code]zxc[/code]', () => {
        expect(MarkdownTokenizer.parse('qwe [code]zxc[/code]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'text', content: 'qwe ' },
              { type: 'code_inline', content: 'zxc' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('``zxc```', () => {
        expect(MarkdownTokenizer.parse('``zxc```')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'code_inline', content: 'zxc' },
              { type: 'text', content: '`' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('a`zxc`A', () => {
        expect(MarkdownTokenizer.parse('a`zxc`A')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'text', content: 'a' },
              { type: 'code_inline', content: 'zxc' },
              { type: 'text', content: 'A' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('z`zxc', () => {
        expect(MarkdownTokenizer.parse('z`zxc')).to.eql([
          ...text('z`zxc')
        ]);
      });
    });


    describe('spoiler_inline', () => {
      it('||zxc||', () => {
        expect(MarkdownTokenizer.parse('||zxc||')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'spoiler_inline', direction: 'open', bbcode: '||' },
              { type: 'text', content: 'zxc' },
              { type: 'spoiler_inline', direction: 'close', bbcode: '||' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('||z', () => {
        expect(MarkdownTokenizer.parse('||z')).to.eql([
          ...text('||z')
        ]);
      });

      it('z||', () => {
        expect(MarkdownTokenizer.parse('z||')).to.eql([
          ...text('z||')
        ]);
      });
    });

    describe('color', () => {
      it('[color=red]zxc[/color]', () => {
        expect(MarkdownTokenizer.parse('[color=red]zxc[/color]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'color_inline',
                direction: 'open',
                attrs: [['color', 'red']],
                bbcode: '[color=red]'
              },
              { type: 'text', content: 'zxc' },
              { type: 'color_inline', direction: 'close', bbcode: '[/color]' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[color=red]z', () => {
        expect(MarkdownTokenizer.parse('[color=red]z')).to.eql([
          ...text('[color=red]z')
        ]);
      });

      it('z[/color]', () => {
        expect(MarkdownTokenizer.parse('z[/color]')).to.eql([
          ...text('z[/color]')
        ]);
      });
    });

    describe('size_inline', () => {
      it('[size=20]zxc[/size]', () => {
        expect(MarkdownTokenizer.parse('[size=20]zxc[/size]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'size_inline',
                direction: 'open',
                attrs: [['size', '20']],
                bbcode: '[size=20]'
              },
              { type: 'text', content: 'zxc' },
              { type: 'size_inline', direction: 'close', bbcode: '[/size]' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[size=20]z', () => {
        expect(MarkdownTokenizer.parse('[size=20]z')).to.eql([
          ...text('[size=20]z')
        ]);
      });

      it('z[/size]', () => {
        expect(MarkdownTokenizer.parse('z[/size]')).to.eql([
          ...text('z[/size]')
        ]);
      });
    });

    describe('link_inline', () => {
      it('[url=https://ya.ru]zxc[/url]', () => {
        expect(MarkdownTokenizer.parse('[url=https://ya.ru]zxc[/url]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'link_inline',
                direction: 'open',
                bbcode: '[url=https://ya.ru]',
                attrs: [['url', 'https://ya.ru']]
              },
              { type: 'text', content: 'zxc' },
              { type: 'link_inline', direction: 'close', bbcode: '[/url]' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[url=ya.ru]zxc[/url]', () => {
        expect(MarkdownTokenizer.parse('[url=ya.ru]zxc[/url]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'link_inline',
                direction: 'open',
                bbcode: '[url=ya.ru]',
                attrs: [['url', '//ya.ru']]
              },
              { type: 'text', content: 'zxc' },
              { type: 'link_inline', direction: 'close', bbcode: '[/url]' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[url]https://ya.ru[/url]', () => {
        expect(MarkdownTokenizer.parse('[url]https://ya.ru[/url]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'link_inline',
                direction: 'open',
                attrs: [['url', 'https://ya.ru']]
              },
              { type: 'text', content: 'https://ya.ru' },
              { type: 'link_inline', direction: 'close' }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });


      it('[url=a]z', () => {
        expect(MarkdownTokenizer.parse('[url=a]z')).to.eql([
          ...text('[url=a]z')
        ]);
      });

      it('z[/url]', () => {
        expect(MarkdownTokenizer.parse('z[/url]')).to.eql([
          ...text('z[/url]')
        ]);
      });
    });
  });

  describe('nodes', () => {
    describe('heading', () => {
      describe('level 1', () => {
        it('# a', () => {
          expect(MarkdownTokenizer.parse('# a')).to.eql([
            { type: 'heading', direction: 'open', attrs: [['level', 1]] },
            { type: 'inline', children: [{ type: 'text', content: 'a' }] },
            { type: 'heading', direction: 'close' }
          ]);
        });
      });

      describe('level 2', () => {
        it('## a', () => {
          expect(MarkdownTokenizer.parse('## a')).to.eql([
            { type: 'heading', direction: 'open', attrs: [['level', 2]] },
            { type: 'inline', children: [{ type: 'text', content: 'a' }] },
            { type: 'heading', direction: 'close' }
          ]);
        });
      });

      describe('level 3', () => {
        it('### a', () => {
          expect(MarkdownTokenizer.parse('### a')).to.eql([
            { type: 'heading', direction: 'open', attrs: [['level', 3]] },
            { type: 'inline', children: [{ type: 'text', content: 'a' }] },
            { type: 'heading', direction: 'close' }
          ]);
        });
      });

      describe('level 4', () => {
        it('#### a', () => {
          expect(MarkdownTokenizer.parse('#### a')).to.eql([
            { type: 'heading', direction: 'open', attrs: [['level', 4]] },
            { type: 'inline', children: [{ type: 'text', content: 'a' }] },
            { type: 'heading', direction: 'close' }
          ]);
        });
      });

      describe('level 5', () => {
        it('##### a', () => {
          expect(MarkdownTokenizer.parse('##### a')).to.eql([
            { type: 'heading', direction: 'open', attrs: [['level', 5]] },
            { type: 'inline', children: [{ type: 'text', content: 'a' }] },
            { type: 'heading', direction: 'close' }
          ]);
        });
      });
    });
  //
    describe('blockquote', () => {
      it('> a', () => {
        expect(MarkdownTokenizer.parse('> a')).to.eql([
          { type: 'blockquote', direction: 'open' },
          ...text('a'),
          { type: 'blockquote', direction: 'close' }
        ]);
      });

      it('> a\\n> b\\n> c', () => {
        expect(MarkdownTokenizer.parse('> a\n> b\n> c')).to.eql([
          { type: 'blockquote', direction: 'open' },
          ...text('a'),
          ...text('b'),
          ...text('c'),
          { type: 'blockquote', direction: 'close' }
        ]);
      });

      it('> > a', () => {
        expect(MarkdownTokenizer.parse('> > a')).to.eql([
          { type: 'blockquote', direction: 'open' },
          { type: 'blockquote', direction: 'open' },
          ...text('a'),
          { type: 'blockquote', direction: 'close' },
          { type: 'blockquote', direction: 'close' }
        ]);
      });

      it('> > a\\n> b', () => {
        expect(MarkdownTokenizer.parse('> > a\n> b')).to.eql([
          { type: 'blockquote', direction: 'open' },
          { type: 'blockquote', direction: 'open' },
          ...text('a'),
          { type: 'blockquote', direction: 'close' },
          ...text('b'),
          { type: 'blockquote', direction: 'close' }
        ]);
      });

      it('> a\\n> > b\\n> > c', () => {
        expect(MarkdownTokenizer.parse('> a\n> > b\n> > c')).to.eql([
          { type: 'blockquote', direction: 'open' },
          ...text('a'),
          { type: 'blockquote', direction: 'open' },
          ...text('b'),
          ...text('c'),
          { type: 'blockquote', direction: 'close' },
          { type: 'blockquote', direction: 'close' }
        ]);
      });

      it('> [quote]\\n> a\\n> [/quote]', () => {
        expect(MarkdownTokenizer.parse('> [quote]\n> a\n> [/quote]')).to.eql([
          { type: 'blockquote', direction: 'open' },
          { type: 'quote', direction: 'open', attrs: n(false, true, true) },
          ...text('a'),
          { type: 'quote', direction: 'close' },
          { type: 'blockquote', direction: 'close' }
        ]);
      });
    });

    describe('bullet_list', () => {
      it('- a', () => {
        expect(MarkdownTokenizer.parse('- a')).to.eql([
          { type: 'bullet_list', direction: 'open' },
          { type: 'list_item', direction: 'open' },
          ...text('a'),
          { type: 'list_item', direction: 'close' },
          { type: 'bullet_list', direction: 'close' }
        ]);
      });

      it('- a\\n- b', () => {
        expect(MarkdownTokenizer.parse('- a\n- b')).to.eql([
          { type: 'bullet_list', direction: 'open' },
          { type: 'list_item', direction: 'open' },
          ...text('a'),
          { type: 'list_item', direction: 'close' },
          { type: 'list_item', direction: 'open' },
          ...text('b'),
          { type: 'list_item', direction: 'close' },
          { type: 'bullet_list', direction: 'close' }
        ]);
      });

      it('- test\\nn  zxc', () => {
        expect(MarkdownTokenizer.parse('- test\n  zxc')).to.eql([
          { type: 'bullet_list', direction: 'open' },
          { type: 'list_item', direction: 'open' },
          ...text('test'),
          ...text('zxc'),
          { type: 'list_item', direction: 'close' },
          { type: 'bullet_list', direction: 'close' }
        ]);
      });

      it('- > test', () => {
        expect(MarkdownTokenizer.parse('- > test')).to.eql([
          { type: 'bullet_list', direction: 'open' },
          { type: 'list_item', direction: 'open' },
          { type: 'blockquote', direction: 'open' },
          ...text('test'),
          { type: 'blockquote', direction: 'close' },
          { type: 'list_item', direction: 'close' },
          { type: 'bullet_list', direction: 'close' }
        ]);
      });

      it('[*] a', () => {
        expect(MarkdownTokenizer.parse('[*] a')).to.eql([
          { type: 'bullet_list', direction: 'open' },
          { type: 'list_item', direction: 'open' },
          ...text('a'),
          { type: 'list_item', direction: 'close' },
          { type: 'bullet_list', direction: 'close' }
        ]);
      });

      it('[*]a', () => {
        expect(MarkdownTokenizer.parse('[*]a')).to.eql([
          { type: 'bullet_list', direction: 'open' },
          { type: 'list_item', direction: 'open' },
          ...text('a'),
          { type: 'list_item', direction: 'close' },
          { type: 'bullet_list', direction: 'close' }
        ]);
      });
    });

    describe('code_block', () => {
      it('```\\nzxc\\n```', () => {
        expect(MarkdownTokenizer.parse('```\nzxc\n```')).to.eql([
          { type: 'code_block', content: 'zxc' }
        ]);
      });

      it('```\\nzxc\\nvbn\\n```', () => {
        expect(MarkdownTokenizer.parse('```\nzxc\nvbn\n```')).to.eql([
          { type: 'code_block', content: 'zxc\nvbn' }
        ]);
      });

      it('qwe\\n```\\nzxc\\nvbn\\n```\\nrty', () => {
        expect(MarkdownTokenizer.parse('qwe\n```\nzxc\nvbn\n```\nrty')).to.eql([
          ...text('qwe'),
          { type: 'code_block', content: 'zxc\nvbn' },
          ...text('rty')
        ]);
      });

      it('```\\nzxc', () => {
        expect(MarkdownTokenizer.parse('```\nzxc')).to.eql([
          ...text('```'),
          ...text('zxc')
        ]);
      });

      it('```css\\nzxc', () => {
        expect(MarkdownTokenizer.parse('```css\nzxc')).to.eql([
          ...text('```css'),
          ...text('zxc')
        ]);
      });

      it('```ruby\\nzxc\\n```', () => {
        expect(MarkdownTokenizer.parse('```ruby\nzxc\n```')).to.eql([
          { type: 'code_block', content: 'zxc', attrs: [['language', 'ruby']] }
        ]);
      });

      it('[code]\\nzxc\\n[/code]', () => {
        expect(MarkdownTokenizer.parse('[code]\nzxc\n[/code]')).to.eql([
          { type: 'code_block', content: 'zxc' }
        ]);
      });

      it('q[code=css]w[/code]e', () => {
        expect(MarkdownTokenizer.parse('q[code=css]w[/code]e')).to.eql([
          ...text('q'),
          { type: 'code_block', content: 'w', attrs: [['language', 'css']] },
          ...text('e')
        ]);
      });
    });

    describe('image', () => {
      it('[img]https://test.com[/img]', () => {
        expect(MarkdownTokenizer.parse(
          '[img]https://test.com[/img]'
        )).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'image',
                attrs: [['src', 'https://test.com'], ['isPoster', false]]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[img c=zxc 400x500]https://test.com[/img]', () => {
        expect(MarkdownTokenizer.parse(
          '[img c=zxc 400x500]https://test.com[/img]'
        )).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'image',
                attrs: [
                  ['src', 'https://test.com'],
                  ['isPoster', false],
                  ['class', 'zxc'],
                  ['width', '400'],
                  ['height', '500']
                ]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[poster]https://test.com[/poster]', () => {
        expect(MarkdownTokenizer.parse(
          '[poster]https://test.com[/poster]'
        )).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'image',
                attrs: [['src', 'https://test.com'], ['isPoster', true]]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[img]zxc', () => {
        expect(MarkdownTokenizer.parse('[img]zxc')).to.eql([
          ...text('[img]zxc')
        ]);
      });

      it('[poster]zxc', () => {
        expect(MarkdownTokenizer.parse('[poster]zxc')).to.eql([
          ...text('[poster]zxc')
        ]);
      });
    });

    describe('smiley', () => {
      it(':V:', () => {
        expect(MarkdownTokenizer.parse(
          ':V:'
        )).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'smiley', attrs: [['kind', ':V:']] }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it(':)', () => {
        expect(MarkdownTokenizer.parse(
          ':)'
        )).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'smiley', attrs: [['kind', ':)']] }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it(':):)', () => {
        expect(MarkdownTokenizer.parse(
          ':):)'
        )).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'smiley', attrs: [['kind', ':)']] },
              { type: 'smiley', attrs: [['kind', ':)']] }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it(':)\\n:shock2: :scream:', () => {
        expect(MarkdownTokenizer.parse(
          ':)\n:shock2: :scream:'
        )).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'smiley', attrs: [['kind', ':)']] }
            ]
          },
          { type: 'paragraph', direction: 'close' },
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              { type: 'smiley', attrs: [['kind', ':shock2:']] },
              { type: 'text', content: ' ' },
              { type: 'smiley', attrs: [['kind', ':scream:']] }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it(':zxc:', () => {
        expect(MarkdownTokenizer.parse(':zxc:')).to.eql([
          ...text(':zxc:')
        ]);
      });
    });

    describe('spoiler', () => {
      it('[spoiler]z[/spoiler]', () => {
        expect(MarkdownTokenizer.parse('[spoiler]z[/spoiler]')).to.eql([
          { type: 'spoiler_block', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'spoiler_block', direction: 'close' }
        ]);
      });

      it('[spoiler=qw er]z[/spoiler]', () => {
        expect(MarkdownTokenizer.parse('[spoiler=qw er]z[/spoiler]')).to.eql([
          {
            type: 'spoiler_block',
            direction: 'open',
            attrs: [['label', 'qw er'], ...n()]
          },
          ...text('z'),
          { type: 'spoiler_block', direction: 'close' }
        ]);
      });

      // it('[spoiler=q[b]w[i]e[/i]r[/b]t]z[/spoiler]', () => {
      //   expect(MarkdownTokenizer.parse('[spoiler=q[b]w[i]e[/i]r[/b]t]z[/spoiler]')).to.eql([{
      //     type: 'spoiler_block', direction: 'open',
      //     attrs: [['label', 'q[b]w[i]e[/i]r[/b]t']]
      //   },
      //   ...text('z'),
      //   {
      //     type: 'spoiler_block', direction: 'close'
      //   }]);
      // });

      it('[spoiler=qw er]z[/spoiler]', () => {
        expect(MarkdownTokenizer.parse('[spoiler=qw er]z[/spoiler]')).to.eql([
          {
            type: 'spoiler_block',
            direction: 'open',
            attrs: [['label', 'qw er'], ...n()]
          },
          ...text('z'),
          { type: 'spoiler_block', direction: 'close' }
        ]);
      });

      it('[spoiler]\\nz\\n[/spoiler]', () => {
        expect(MarkdownTokenizer.parse('[spoiler]\nz\n[/spoiler]')).to.eql([
          {
            type: 'spoiler_block',
            direction: 'open',
            attrs: n(false, true, true)
          },
          ...text('z'),
          { type: 'spoiler_block', direction: 'close' }
        ]);
      });

      it('[spoiler]\\nz[/spoiler]', () => {
        expect(MarkdownTokenizer.parse('[spoiler]\nz[/spoiler]')).to.eql([
          { type: 'spoiler_block', direction: 'open', attrs: n(false, true) },
          ...text('z'),
          { type: 'spoiler_block', direction: 'close' }
        ]);
      });

      it('[spoiler]\\nz[/spoiler]qwe', () => {
        expect(MarkdownTokenizer.parse('[spoiler]\nz[/spoiler]qwe')).to.eql([
          { type: 'spoiler_block', direction: 'open', attrs: n(false, true) },
          ...text('z'),
          { type: 'spoiler_block', direction: 'close' },
          ...text('qwe')
        ]);
      });
    });

    describe('quote', () => {
      it('[quote]z[/quote]', () => {
        expect(MarkdownTokenizer.parse('[quote]z[/quote]')).to.eql([
          { type: 'quote', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'quote', direction: 'close' }
        ]);
      });

      it('[quote]\\nz\\n[/quote]', () => {
        expect(MarkdownTokenizer.parse('[quote]\nz\n[/quote]')).to.eql([
          { type: 'quote', direction: 'open', attrs: n(false, true, true) },
          ...text('z'),
          { type: 'quote', direction: 'close' }
        ]);
      });

      it('q[quote]z[/quote]x', () => {
        expect(MarkdownTokenizer.parse('q[quote]z[/quote]x')).to.eql([
          ...text('q'),
          { type: 'quote', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          ...text('x')
        ]);
      });

      it('[quote]z[/quote]q', () => {
        expect(MarkdownTokenizer.parse('[quote]z[/quote]q')).to.eql([
          { type: 'quote', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          ...text('q')
        ]);
      });

      it('[quote=x]z[/quote]', () => {
        expect(MarkdownTokenizer.parse('[quote=x]z[/quote]')).to.eql([
          {
            type: 'quote',
            direction: 'open',
            attrs: [['nickname', 'x'], ...n()]
          },
          ...text('z'),
          { type: 'quote', direction: 'close' }
        ]);
      });

      it('[quote=t1;2;x]z[/quote]', () => {
        expect(MarkdownTokenizer.parse('[quote=t1;2;x]z[/quote]')).to.eql([
          {
            type: 'quote',
            direction: 'open',
            attrs: [['topic_id', 1], ['user_id', 2], ['nickname', 'x'], ...n()]
          },
          ...text('z'),
          {
            type: 'quote', direction: 'close'
          }
        ]);
      });

      it('[quote=m1;2;x]z[/quote]', () => {
        expect(MarkdownTokenizer.parse('[quote=m1;2;x]z[/quote]')).to.eql([
          {
            type: 'quote',
            direction: 'open',
            attrs: [['message_id', 1], ['user_id', 2], ['nickname', 'x'], ...n()]
          },
          ...text('z'),
          {
            type: 'quote', direction: 'close'
          }
        ]);
      });
    });
  //
    describe('center', () => {
      it('[center]z[/center]', () => {
        expect(MarkdownTokenizer.parse('[center]z[/center]')).to.eql([
          { type: 'center', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'center', direction: 'close' }
        ]);
      });

      it('z[center]x[/center]c', () => {
        expect(MarkdownTokenizer.parse('z[center]x[/center]c')).to.eql([
          ...text('z'),
          { type: 'center', direction: 'open', attrs: n() },
          ...text('x'),
          { type: 'center', direction: 'close' },
          ...text('c')
        ]);
      });
    });
  //
    describe('right', () => {
      it('[right]z[/right]', () => {
        expect(MarkdownTokenizer.parse('[right]z[/right]')).to.eql([
          { type: 'right', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'right', direction: 'close' }
        ]);
      });

      it('z[right]x[/right]c', () => {
        expect(MarkdownTokenizer.parse('z[right]x[/right]c')).to.eql([
          ...text('z'),
          { type: 'right', direction: 'open', attrs: n() },
          ...text('x'),
          { type: 'right', direction: 'close' },
          ...text('c')
        ]);
      });
    });
  //
    describe('list', () => {
      it('[list]z[/list]', () => {
        expect(MarkdownTokenizer.parse('[list]z[/list]')).to.eql([
          {
            type: 'div',
            direction: 'open',
            attrs: [
              [
                'data',
                [[
                  'data-deperecation',
                  '[list] is deprecated, use [*] without wrapping them in [list] tag'
                ]]
              ],
              ...n()
            ]
          },
          ...text('z'),
          { type: 'div', direction: 'close' }
        ]);
      });
    });

    describe('div', () => {
      it('[div]z[/div]', () => {
        expect(MarkdownTokenizer.parse('[div]z[/div]')).to.eql([
          { type: 'div', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'div', direction: 'close' }
        ]);
      });

      it('  [div]z[/div]', () => {
        expect(MarkdownTokenizer.parse('  [div]z[/div]')).to.eql([
          { type: 'div', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'div', direction: 'close' }
        ]);
      });

      it('[div][div]z[/div][/div]', () => {
        expect(MarkdownTokenizer.parse('[div][div]z[/div][/div]')).to.eql([
          { type: 'div', direction: 'open', attrs: n() },
          { type: 'div', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'div', direction: 'close' },
          { type: 'div', direction: 'close' }
        ]);
      });

      it('[div]  [div]z[/div][/div]', () => {
        expect(MarkdownTokenizer.parse('[div]  [div]z[/div][/div]')).to.eql([
          { type: 'div', direction: 'open', attrs: n() },
          { type: 'div', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'div', direction: 'close' },
          { type: 'div', direction: 'close' }
        ]);
      });

      it('[div][div]z[/div][/div]', () => {
        expect(MarkdownTokenizer.parse('[div][div]z[/div][/div]')).to.eql([
          { type: 'div', direction: 'open', attrs: n() },
          { type: 'div', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'div', direction: 'close' },
          { type: 'div', direction: 'close' }
        ]);
      });

      it('[div data-test=qwe]z[/div]', () => {
        expect(MarkdownTokenizer.parse(
          '[div data-test=qwe]z[/div]'
        )).to.eql([
          {
            type: 'div',
            direction: 'open',
            attrs: [['data', [['data-test', 'qwe']]], ...n()]
          },
          ...text('z'),
          { type: 'div', direction: 'close' }
        ]);
      });

      it('[div data-test data-fofo]z[/div]', () => {
        expect(MarkdownTokenizer.parse(
          '[div data-test data-fofo]z[/div]'
        )).to.eql([
          {
            type: 'div',
            direction: 'open',
            attrs: [['data', [['data-test', ''], ['data-fofo', '']]], ...n()]
          },
          ...text('z'),
          {
            type: 'div', direction: 'close'
          }
        ]);
      });

      it('[div=aaa bb-cd_e data-test data-fofo]z[/div]', () => {
        expect(MarkdownTokenizer.parse(
          '[div=aaa bb-cd_e data-test data-fofo]z[/div]'
        )).to.eql([
          {
            type: 'div',
            direction: 'open',
            attrs: [
              ['class', 'aaa bb-cd_e'],
              ['data', [['data-test', ''], ['data-fofo', '']]],
              ...n()
            ]
          },
          ...text('z'),
          {
            type: 'div', direction: 'close'
          }
        ]);
      });

      it('[div]q[div]z[/div][/div]', () => {
        expect(MarkdownTokenizer.parse('[div]q[div]z[/div][/div]')).to.eql([
          { type: 'div', direction: 'open', attrs: n() },
          ...text('q[div]z[/div]'),
          { type: 'div', direction: 'close' }
        ]);
      });

      it('z[div]x[/div]c', () => {
        expect(MarkdownTokenizer.parse('z[div]x[/div]c')).to.eql([
          ...text('z[div]x[/div]c')
        ]);
      });

      it('z[div][/div]c', () => {
        expect(MarkdownTokenizer.parse('z[div][/div]c')).to.eql([
          ...text('z[div][/div]c')
        ]);
      });

      it('a[div]\\n[/div]', () => {
        expect(MarkdownTokenizer.parse('a[div]\n[/div]')).to.eql([
          ...text('a[div]'),
          ...text('[/div]')
        ]);
      });

      it('a[div]\\nc[/div]', () => {
        expect(MarkdownTokenizer.parse('a[div]\nc[/div]')).to.eql([
          ...text('a[div]'),
          ...text('c[/div]')
        ]);
      });

      it('a[div]z\\nx\\nc[/div]', () => {
        expect(MarkdownTokenizer.parse('a[div]z\nx\nc[/div]')).to.eql([
          ...text('a[div]z'),
          ...text('x'),
          ...text('c[/div]')
        ]);
      });

      it('a[div]z\\nx\\nc[/div]v', () => {
        expect(MarkdownTokenizer.parse('a[div]z\nx\nc[/div]v')).to.eql([
          ...text('a[div]z'),
          ...text('x'),
          ...text('c[/div]v')
        ]);
      });

      it('[div]z', () => {
        expect(MarkdownTokenizer.parse('[div]z')).to.eql([
          ...text('[div]z')
        ]);
      });

      it(' [div]z', () => {
        expect(MarkdownTokenizer.parse(' [div]z')).to.eql([
          ...text(' [div]z')
        ]);
      });
    });

    describe('hr', () => {
      it('z\\n[hr]\\nx', () => {
        expect(MarkdownTokenizer.parse('z\n[hr]\nx')).to.eql([
          ...text('z'),
          { type: 'hr' },
          ...text('x')
        ]);
      });

      it('z[hr]x', () => {
        expect(MarkdownTokenizer.parse('z[hr]x')).to.eql([
          ...text('z'),
          { type: 'hr' },
          ...text('x')
        ]);
      });
    });

    describe('link_block', () => {
      it('[url=//ya.ru][quote]z[/quote][/url]', () => {
        expect(MarkdownTokenizer.parse(
          '[url=//ya.ru][quote]z[/quote][/url]'
        )).to.eql([
          {
            type: 'link_block',
            direction: 'open',
            attrs: [['url', '//ya.ru'], ...n()]
          },
          { type: 'quote', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'link_block', direction: 'close' }
        ]);
      });

      it('[url=//ya.ru]\\n[quote]\\nz\\n[/quote]\\n[/url]', () => {
        expect(MarkdownTokenizer.parse(
          '[url=//ya.ru]\n[quote]\nz\n[/quote]\n[/url]'
        )).to.eql([
          {
            type: 'link_block',
            direction: 'open',
            attrs: [['url', '//ya.ru'], ...n(false, true, true)]
          },
          { type: 'quote', direction: 'open', attrs: n(false, true) },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'link_block', direction: 'close' }]);
      });

      it('[url=//ya.ru]\\nz\\n[/url]', () => {
        expect(MarkdownTokenizer.parse(
          '[url=//ya.ru]\nz\n[/url]'
        )).to.eql([
          {
            type: 'link_block',
            direction: 'open',
            attrs: [['url', '//ya.ru'], ...n(false, true, true)]
          },
          ...text('z'),
          { type: 'link_block', direction: 'close' }]);
      });
    });

    describe('size_block', () => {
      it('[size=24][quote]z[/quote][/size]', () => {
        expect(MarkdownTokenizer.parse(
          '[size=24][quote]z[/quote][/size]'
        )).to.eql([
          {
            type: 'size_block',
            direction: 'open',
            attrs: [['size', '24'], ...n()]
          },
          { type: 'quote', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'size_block', direction: 'close' }
        ]);
      });

      it('[size=24]\\n[quote]\\nz\\n[/quote]\\n[/size]', () => {
        expect(MarkdownTokenizer.parse(
          '[size=24]\n[quote]\nz\n[/quote]\n[/size]'
        )).to.eql([
          {
            type: 'size_block',
            direction: 'open',
            attrs: [['size', '24'], ...n(false, true, true)]
          },
          { type: 'quote', direction: 'open', attrs: n(false, true, true, true) },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'size_block', direction: 'close' }]);
      });

      it('[size=24]qwe\\nzxc[/size]', () => {
        expect(MarkdownTokenizer.parse(
          '[size=24]qwe\nzxc[/size]'
        )).to.eql([
          {
            type: 'size_block',
            direction: 'open',
            attrs: [['size', '24'], ...n()]
          },
          ...text('qwe'),
          ...text('zxc'),
          { type: 'size_block', direction: 'close' }]);
      });
    });

    describe('color_block', () => {
      it('[color=red][quote]z[/quote][/color]', () => {
        expect(MarkdownTokenizer.parse(
          '[color=red][quote]z[/quote][/color]'
        )).to.eql([
          {
            type: 'color_block',
            direction: 'open',
            attrs: [['color', 'red'], ...n()]
          },
          { type: 'quote', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'color_block', direction: 'close' }
        ]);
      });

      it('[color=red]\\n[quote]\\nz\\n[/quote]\\n[/color]', () => {
        expect(MarkdownTokenizer.parse(
          '[color=red]\n[quote]\nz\n[/quote]\n[/color]'
        )).to.eql([
          {
            type: 'color_block',
            direction: 'open',
            attrs: [['color', 'red'], ...n(false, true, true)]
          },
          { type: 'quote', direction: 'open', attrs: n(false, true, false, true) },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'color_block', direction: 'close' }]);
      });

      it('[color=red]qwe\\nzxc[/color]', () => {
        expect(MarkdownTokenizer.parse(
          '[color=red]qwe\nzxc[/color]'
        )).to.eql([
          {
            type: 'color_block',
            direction: 'open',
            attrs: [['color', 'red'], ...n()]
          },
          ...text('qwe'),
          ...text('zxc'),
          { type: 'color_block', direction: 'close' }]);
      });
    });

    describe('bold_block', () => {
      it('[b]\\nz\\n[/b]', () => {
        expect(MarkdownTokenizer.parse(
          '[b]\nz\n[/b]'
        )).to.eql([
          { type: 'bold_block', direction: 'open', attrs: n(false, true, true) },
          ...text('z'),
          { type: 'bold_block', direction: 'close' }
        ]);
      });

      it('[b][quote]z[/quote][/b]', () => {
        expect(MarkdownTokenizer.parse(
          '[b][quote]z[/quote][/b]'
        )).to.eql([
          { type: 'bold_block', direction: 'open', attrs: n() },
          { type: 'quote', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'bold_block', direction: 'close' }
        ]);
      });

      it('[b]\\n[quote]\\nz\\n[/quote]\\n[/b]', () => {
        expect(MarkdownTokenizer.parse(
          '[b]\n[quote]\nz\n[/quote]\n[/b]'
        )).to.eql([
          { type: 'bold_block', direction: 'open', attrs: n(false, true, true) },
          { type: 'quote', direction: 'open', attrs: n(false, true) },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'bold_block', direction: 'close' }]);
      });

      it('[b]qwe\\nzxc[/b]', () => {
        expect(MarkdownTokenizer.parse(
          '[b]qwe\nzxc[/b]'
        )).to.eql([
          { type: 'bold_block', direction: 'open', attrs: n() },
          ...text('qwe'),
          ...text('zxc'),
          { type: 'bold_block', direction: 'close' }]);
      });
    });

    describe('italic_block', () => {
      it('[i][quote]z[/quote][/i]', () => {
        expect(MarkdownTokenizer.parse(
          '[i][quote]z[/quote][/i]'
        )).to.eql([
          { type: 'italic_block', direction: 'open', attrs: n() },
          { type: 'quote', direction: 'open', attrs: n() },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'italic_block', direction: 'close' }
        ]);
      });

      it('[i]\\n[quote]\\nz\\n[/quote]\\n[/i]', () => {
        expect(MarkdownTokenizer.parse(
          '[i]\n[quote]\nz\n[/quote]\n[/i]'
        )).to.eql([
          { type: 'italic_block', direction: 'open', attrs: n(false, true, true) },
          { type: 'quote', direction: 'open', attrs: n(false, true) },
          ...text('z'),
          { type: 'quote', direction: 'close' },
          { type: 'italic_block', direction: 'close' }]);
      });

      it('[i]qwe\\nzxc[/i]', () => {
        expect(MarkdownTokenizer.parse(
          '[i]qwe\nzxc[/i]'
        )).to.eql([
          { type: 'italic_block', direction: 'open', attrs: n() },
          ...text('qwe'),
          ...text('zxc'),
          { type: 'italic_block', direction: 'close' }]);
      });
    });
  });

  describe('shiki nodes', () => {
    describe('shiki_inline', () => {
      it('[anime=1]', () => {
        expect(MarkdownTokenizer.parse('[anime=1]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'shiki_inline',
                attrs: [
                  ['bbcode', '[anime=1]'],
                  ['type', 'anime'],
                  ['id', 1],
                  ['isLoading', true],
                  ['isError', false]
                ]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[anime=1]zx[/anime]', () => {
        expect(MarkdownTokenizer.parse('[anime=1]zx[/anime]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'shiki_inline',
                attrs: [
                  ['bbcode', '[anime=1]zx[/anime]'],
                  ['type', 'anime'],
                  ['id', 1],
                  ['openBbcode', '[anime=1]'],
                  ['closeBbcode', '[/anime]'],
                  ['text', 'zx'],
                  ['isLoading', true],
                  ['isError', false]
                ],
                children: [{ type: 'text', content: 'zx' }]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[anime=1]z[/anime] [anime=2]x[/anime]', () => {
        expect(MarkdownTokenizer.parse(
          '[anime=1]z[/anime] [anime=2]x[/anime]'
        )).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'shiki_inline',
                attrs: [
                  ['bbcode', '[anime=1]z[/anime]'],
                  ['type', 'anime'],
                  ['id', 1],
                  ['openBbcode', '[anime=1]'],
                  ['closeBbcode', '[/anime]'],
                  ['text', 'z'],
                  ['isLoading', true],
                  ['isError', false]
                ],
                children: [{ type: 'text', content: 'z' }]
              },
              { type: 'text', content: ' ' },
              {
                type: 'shiki_inline',
                attrs: [
                  ['bbcode', '[anime=2]x[/anime]'],
                  ['type', 'anime'],
                  ['id', 2],
                  ['openBbcode', '[anime=2]'],
                  ['closeBbcode', '[/anime]'],
                  ['text', 'x'],
                  ['isLoading', true],
                  ['isError', false]
                ],
                children: [{ type: 'text', content: 'x' }]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[poster=1]', () => {
        expect(MarkdownTokenizer.parse('[poster=1]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'shiki_inline',
                attrs: [
                  ['bbcode', '[poster=1]'],
                  ['type', 'poster'],
                  ['id', 1]
                ]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[image=1]', () => {
        expect(MarkdownTokenizer.parse('[image=1]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'shiki_inline',
                attrs: [
                  ['bbcode', '[image=1]'],
                  ['type', 'image'],
                  ['id', 1]
                ]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });

      it('[image=1 c=zxc 400x500]', () => {
        expect(MarkdownTokenizer.parse(
          '[image=1 c=zxc 400x500]'
        )).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'shiki_inline',
                attrs: [
                  ['bbcode', '[image=1 c=zxc 400x500]'],
                  ['type', 'image'],
                  ['id', 1],
                  ['meta', { 'class': 'zxc', 'height': '500', 'width': '400' }]
                ]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });


      it('[image=1]zxc[/image]', () => {
        expect(MarkdownTokenizer.parse('[image=1]zxc[/image]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'shiki_inline',
                attrs: [
                  ['bbcode', '[image=1]'],
                  ['type', 'image'],
                  ['id', 1]
                ]
              },
              {
                type: 'text',
                content: 'zxc[/image]'
              }
            ]
          },
          { type: 'paragraph', direction: 'close' }
        ]);
      });
    });

    describe('shiki_block', () => {
      it('[anime=1]\\nzx[/anime]', () => {
        expect(MarkdownTokenizer.parse('[anime=1]\nzx[/anime]')).to.eql([
          {
            type: 'shiki_block',
            attrs: [
              ['type', 'anime'],
              ['id', 1],
              ['bbcode', '[anime=1]\nzx[/anime]'],
              ['openBbcode', '[anime=1]'],
              ['closeBbcode', '[/anime]'],
              ['isLoading', true],
              ['isError', false]
            ],
            children: [
              ...text('zx')
            ]
          }
        ]);
      });

      it('[anime=1]\\nzx\\n[/anime]', () => {
        expect(MarkdownTokenizer.parse('[anime=1]\nzx\n[/anime]')).to.eql([
          {
            type: 'shiki_block',
            attrs: [
              ['type', 'anime'],
              ['id', 1],
              ['bbcode', '[anime=1]\nzx\n[/anime]'],
              ['openBbcode', '[anime=1]'],
              ['closeBbcode', '[/anime]'],
              ['isLoading', true],
              ['isError', false]
            ],
            children: [
              ...text('zx')
            ]
          }
        ]);
      });

      it('[anime=1]\\nz\\n[/anime]\\n[anime=2]\\nx\\n[/anime]', () => {
        expect(MarkdownTokenizer.parse(
          '[anime=1]\nz\n[/anime]\n[anime=2]\nx\n[/anime]'
        )).to.eql([
          {
            type: 'shiki_block',
            attrs: [
              ['type', 'anime'],
              ['id', 1],
              ['bbcode', '[anime=1]\nz\n[/anime]'],
              ['openBbcode', '[anime=1]'],
              ['closeBbcode', '[/anime]'],
              ['isLoading', true],
              ['isError', false]
            ],
            children: [
              ...text('z')
            ]
          },
          {
            type: 'shiki_block',
            attrs: [
              ['type', 'anime'],
              ['id', 2],
              ['bbcode', '[anime=2]\nx\n[/anime]'],
              ['openBbcode', '[anime=2]'],
              ['closeBbcode', '[/anime]'],
              ['isLoading', true],
              ['isError', false]
            ],
            children: [
              ...text('x')
            ]
          }
        ]);
      });


      it('[anime=1]\\n[anime=1]\\nzx[/anime]', () => {
        expect(MarkdownTokenizer.parse('[anime=1]\n[anime=1]\nzx[/anime]')).to.eql([
          { type: 'paragraph', direction: 'open' },
          {
            type: 'inline',
            children: [
              {
                type: 'shiki_inline',
                attrs: [
                  ['bbcode', '[anime=1]'],
                  ['type', 'anime'],
                  ['id', 1],
                  ['isLoading', true],
                  ['isError', false]
                ]
              }
            ]
          },
          { type: 'paragraph', direction: 'close' },
          {
            type: 'shiki_block',
            attrs: [
              ['type', 'anime'],
              ['id', 1],
              ['bbcode', '[anime=1]\nzx[/anime]'],
              ['openBbcode', '[anime=1]'],
              ['closeBbcode', '[/anime]'],
              ['isLoading', true],
              ['isError', false]
            ],
            children: [
              ...text('zx')
            ]
          }
        ]);
      });
    });
  });

  describe('complex cases', () => {
    it('outside broken formatting', () => {
      expect(MarkdownTokenizer.parse(
        '[b][center]z[/center][/i]'
      )).to.eql([
        ...text('[b]'),
        { type: 'center', direction: 'open', attrs: n() },
        ...text('z'),
        { type: 'center', direction: 'close' },
        ...text('[/i]')
      ]);
    });

    it('treat new line after [hr]', () => {
      expect(MarkdownTokenizer.parse(
        '[hr]\n[spoiler]z[/spoiler]'
      )).to.eql([
        { type: 'hr' },
        { type: 'spoiler_block', direction: 'open', attrs: n() },
        ...text('z'),
        { type: 'spoiler_block', direction: 'close' }
      ]);
    });
  });
});
