export default _hljs => ({
  name: 'shiki',
  case_insensitive: true,
  contains: [{
    className: 'section',
    variants: [{
      begin: '^#{1,5}',
      end: '$'
    }]
  }, {
    className: 'tag',
    begin: /#[A-Za-z0-9_-]+/
  }, {
    className: 'number',
    begin: /(?<==)[^\]\s][0-9,\w;А-я]+/
  }, {
    className: 'string',
    begin: /\[[^=\s\]]*/
  }, {
    className: 'string',
    begin: ']'
  }, {
    className: 'keyword',
    begin: /(?<=div=)[^\]]*?(?=data-|])/
  }, {
    className: 'keyword',
    begin: /(?<=spoiler=)[^\]]*?(?=is-|])/
  }, {
    className: 'variable',
    begin: /(?<==)[^\]\s]*/
  }, {
    className: 'tag',
    begin: /(?<=\[[^\]]* )[^\s=\]]*/
  }]
});
