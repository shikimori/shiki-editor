// all constants are inlined into the function so the function can be serialized via JSONfn in shiki code highlight
export default _hljs => {
  const HEADLINE = {
    className: 'section',
    variants: [{
      begin: '^#{1,5}',
      end: '$'
    }]
  };

  const LIST_QUOTE = {
    className: 'bullet',
    begin: '^( *[*+>-])+|\\[\\*\\]',
    excludeEnd: true
  };

  const CODE = {
    className: 'code',
    variants: [
      // TODO: fix to allow these to work with sublanguage also
      { begin: '(`{3,})[^`](.|\\n)*?\\1`*[ ]*' },
      { begin: '(~{3,})[^~](.|\\n)*?\\1~*[ ]*' },
      // needed to allow markdown as a sublanguage to work
      {
        begin: '```',
        end: '```+[ ]*$'
      },
      {
        begin: '~~~',
        end: '~~~+[ ]*$'
      },
      { begin: '`.+?`' },
      {
        begin: '(?=^( {4}|\\t))',
        // use contains to gobble up multiple lines to allow the block to be whatever size
        // but only have a single open/close tag vs one per line
        contains: [
          {
            begin: '^( {4}|\\t)',
            end: '(\\n)$'
          }
        ],
        relevance: 0
      }
    ]
  };

  const INLINE_SPOILER = {
    className: 'selector-class',
    variants: [
      {
        begin: '(\\|{2,})[^\\|].*?\\1\\|*[ ]*'
      }
    ]
  };

  return {
    name: 'shiki',
    case_insensitive: true,
    contains: [
      HEADLINE,
      LIST_QUOTE,
      CODE,
      INLINE_SPOILER,
      // { className: 'keyword', begin: '\\[', end: '/', excludeEnd: true },
      // {
      //   // className: 'string',
      //   scope: 'string',
      //   // begin: /\[[^=\s\]]*/,
      //   // excludeBegin: true,
      //   // excludeEnd: true,
      //   begin: /\[/,
      //   end: /\]/,
      //   illegal: '\\n',
      //   contains: [
      //     { className: 'keyword', begin: '=' },
      //     { className: 'keyword', begin: /\*(?=\])/ },
      //     {
      //       className: 'tag',
      //       begin: /#[A-Za-z0-9_-]+/
      //     }
      //     // { className: 'keyword', begin: /\[\/?/ },
      //     // { className: 'keyword', begin: ']' },
      //   //   // {
      //   //   //   className: 'number',
      //   //   //   begin: /(?<==)[^\]\s][0-9,\w;А-я-]+/
      //   //   // },
      //   //   {
      //   //     className: 'keyword',
      //   //     begin: /\w+/,
      //   //     end: /\s|\]|=/,
      //   //     excludeEnd: true
      //   //   },
      //   //   // 'self'
      //   ]
      // },

      // {
      //   begin: /\[/,
      //   end: /\]/,
      //   illegal: '\\n',
      //   contains: [
      //     {
      //       className: 'tag',
      //       begin: /#[A-Za-z0-9_-]+/
      //     },
      //     {
      //       className: 'number',
      //       begin: /=/,
      //       end: /[^\]\s][0-9,\w;А-я-]+/,
      //       excludeBegin: true
      //     },
      //     {
      //       className: 'string',
      //       begin: /\[[^=\s\]]*/
      //     },
      //     {
      //       className: 'string',
      //       begin: ']'
      //     },
      //     {
      //       className: 'variable',
      //       begin: /=/,
      //       end: /[^\]\s]*/,
      //       excludeBegin: true
      //     },
      //     {
      //       className: 'tag',
      //       begin: /\[[^\]]*/,
      //       end: /[^\s=\]]*/,
      //       excludeBegin: true
      //     }
      //   ]
      // }

      // {
      //   className: 'tag',
      //   begin: /#[A-Za-z0-9_-]+/
      // },
      // {
      //   className: 'number',
      //   begin: /=/,
      //   end: /[^\]\s][0-9,\w;А-я-]+/,
      //   excludeBegin: true
      // },
      {
        scope: 'string',
        begin: '\\[[^=\\s\\]]*',
        end: ']',
        contains: [
          // { className: 'keyword', begin: '\\[', end: '.', excludeEnd: true },
          // { className: 'keyword', begin: ']' },
          // {
          //   className: 'tag',
          //   begin: /#[A-Za-z0-9_-]+/
          // },
          // { className: 'keyword', begin: '\\[' },
          { className: 'keyword', begin: '=' },
          // { className: 'keyword', begin: '\\*' },
          // {
          //   className: 'variable',
          //   begin: /=/,
          //   end: /[^\]\s]*/,
          //   excludeBegin: true
          // },
          // {
          //   scope: 'number',
          //   endsWithParent: true,
          //   begin: /=/,
          //   end: /[0-9,]+(?=\]| )/,
          //   excludeBegin: true,
          //   // illegal: '\\n',
          //   // contains: [
          //   //   { className: 'keyword', begin: ',' },
          //   // ]
          // }
        ]
      },
      // {
      //   className: 'string',
      //   begin: /\[[^=\s\]]*/
      // },
      // {
      //   className: 'string',
      //   begin: ']'
      // },
      // {
      //   className: 'variable',
      //   begin: /=/,
      //   end: /[^\]\s]*/,
      //   excludeBegin: true
      // },
      // {
      //   className: 'tag',
      //   begin: /\[[^\]]*/,
      //   end: /[^\s=\]]*/,
      //   excludeBegin: true
      // }

      // {
      //   className: 'tag',
      //   begin: /#[A-Za-z0-9_-]+/
      // },
      // {
      //   className: 'number',
      //   begin: /(?<==)[^\]\s][0-9,\w;А-я-]+/
      // },
      // {
      //   className: 'string',
      //   begin: /\[[^=\s\]]*/
      // },
      // {
      //   className: 'string',
      //   begin: ']'
      // },
      // {
      //   className: 'variable',
      //   begin: /(?<==)[^\]\s]*/
      // },
      // {
      //   className: 'tag',
      //   begin: /(?<=\[[^\]]* )[^\s=\]]*/
      // }
    ]
  };
};
