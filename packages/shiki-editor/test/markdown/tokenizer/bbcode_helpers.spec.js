import { expect } from 'chai';
import {
  parseCodeMeta,
  parseDivMeta,
  parseImageMeta,
  parseLinkMeta,
  parseQuoteMeta,
  parseSizeMeta,
  parseSpoilerMeta,
  parseShikiBasicMeta
} from '../../../src/markdown/tokenizer/bbcode_helpers';

describe('tokenizer_helpers', () => {
  it('parseCodeMeta', () => {
    expect(parseCodeMeta('')).to.eq(null);
    expect(parseCodeMeta('qwe')).to.eql({
      language: 'qwe'
    });
  });

  it('parseDivMeta', () => {
    expect(parseDivMeta('')).to.eq(null);
    expect(parseDivMeta('aa bb cc')).to.eql({
      class: 'aa bb cc'
    });
    expect(parseDivMeta('data-a data-b')).to.eql({
      data: [['data-a', ''], ['data-b', '']]
    });
    expect(parseDivMeta('a data-b')).to.eql({
      class: 'a',
      data: [['data-b', '']]
    });
    expect(parseDivMeta('a data-b data-c=d')).to.eql({
      class: 'a',
      data: [['data-b', ''], ['data-c', 'd']]
    });
  });

  it('parseImageMeta', () => {
    expect(parseImageMeta('class=qwe')).to.eql({
      class: 'qwe'
    });

    expect(parseImageMeta('100x500')).to.eql({
      width: '100',
      height: '500'
    });

    expect(parseImageMeta('width=100 no-zoom')).to.eql({
      width: '100',
      isNoZoom: true
    });
  });

  it('parseLinkMeta', () => {
    expect(parseLinkMeta('qwe')).to.eql({ url: '//qwe' });
    expect(parseLinkMeta('https://ya.ru')).to.eql({ url: 'https://ya.ru' });
  });

  it('parseQuoteMeta', () => {
    expect(parseQuoteMeta('')).to.eq(null);

    expect(parseQuoteMeta('qwe')).to.eql({
      nickname: 'qwe'
    });

    expect(parseQuoteMeta('c1;1;qwe')).to.eql({
      comment_id: 1,
      user_id: 1,
      nickname: 'qwe'
    });

    expect(parseQuoteMeta('m1;1;qwe')).to.eql({
      message_id: 1,
      user_id: 1,
      nickname: 'qwe'
    });

    expect(parseQuoteMeta('t1;1;qwe')).to.eql({
      topic_id: 1,
      user_id: 1,
      nickname: 'qwe'
    });

    expect(parseQuoteMeta('zxc;1;qwe')).to.eq(null);
  });

  it('parseSizeMeta', () => {
    expect(parseSizeMeta('qwe')).to.eql({ size: 'qwe' });
  });

  it('parseSpoilerMeta', () => {
    expect(parseSpoilerMeta('', null)).to.eq(null);
    expect(parseSpoilerMeta('qwe', null)).to.eql({ label: 'qwe' });
    expect(parseSpoilerMeta('qwe', ' is-fullwidth')).to.eql({
      label: 'qwe',
      isFullwidth: true
    });
    expect(parseSpoilerMeta('qwe', ' is-centered')).to.eql({
      label: 'qwe',
      isCentered: true
    });
    expect(parseSpoilerMeta('qwe', ' is-fullwidth is-centered')).to.eql({
      label: 'qwe',
      isFullwidth: true,
      isCentered: true
    });
    expect(parseSpoilerMeta('qwe', ' is-centered is-fullwidth')).to.eql({
      label: 'qwe',
      isFullwidth: true,
      isCentered: true
    });
  });

  it('parseShikiBasicMeta', () => {
    expect(parseShikiBasicMeta('[anime=1]', 'anime', '1')).to.eql({
      bbcode: '[anime=1]',
      type: 'anime',
      id: 1
    });
  });
});
