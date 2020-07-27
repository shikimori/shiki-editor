// based on https://github.com/ProseMirror/prosemirror-markdown/blob/master/src/from_markdown.js
import MarkdownParseState from './parse_state';
import tokenHandlers from './parser_token_handlers';

// ::- A configuration of a Markdown parser. Such a parser uses
// [markdown-it](https://github.com/markdown-it/markdown-it) to
// tokenize a file, and then runs the custom rules it is given over
// the tokens to create a ProseMirror document tree.
export default class MarkdownParser {
  // :: (Schema, MarkdownIt, Object)
  // Create a parser with the given configuration. You can configure
  // the markdown-it parser to parse the dialect you want, and provide
  // a description of the ProseMirror entities those tokens map to in
  // the `tokens` object, which maps token names to descriptions of
  // what to do with them. Such a description is an object, and may
  // have the following properties:
  //
  // **`node`**`: ?string`
  //   : This token maps to a single node, whose type can be looked up
  //     in the schema under the given name. Exactly one of `node`,
  //     `block`, or `mark` must be set.
  //
  // **`block`**`: ?string`
  //   : This token comes in `_open` and `_close` variants (which are
  //     appended to the base token name provides a the object
  //     property), and wraps a block of content. The block should be
  //     wrapped in a node of the type named to by the property's
  //     value.
  //
  // **`mark`**`: ?string`
  //   : This token also comes in `_open` and `_close` variants, but
  //     should add a mark (named by the value) to its content, rather
  //     than wrapping it in a node.
  //
  // **`attrs`**`: ?Object`
  //   : Attributes for the node or mark. When `getAttrs` is provided,
  //     it takes precedence.
  //
  // **`getAttrs`**`: ?(MarkdownToken) → Object`
  //   : A function used to compute the attributes for the node or mark
  //     that takes a [markdown-it
  //     token](https://markdown-it.github.io/markdown-it/#Token) and
  //     returns an attribute object.
  //
  // **`ignore`**`: ?bool`
  //   : When true, ignore content for the matched token.
  constructor(schema, tokenizer, tokens) {
    // :: Object The value of the `tokens` object used to construct
    // this parser. Can be useful to copy and modify to base other
    // parsers on.
    this.tokens = tokens;
    this.schema = schema;
    this.tokenizer = tokenizer;
    this.tokenHandlers = tokenHandlers(schema, tokens);
  }

  // :: (string) → Node
  // Parse a string as [CommonMark](http://commonmark.org/) markup,
  // and create a ProseMirror document as prescribed by this parser's
  // rules.
  parse(text) {
    const state = new MarkdownParseState(this.schema, this.tokenHandlers);
    let doc;

    const tokens = this.tokenizer.parse(text);
    state.parseTokens(tokens);

    do { doc = state.closeNode(); } while (state.stack.length);
    return doc;
  }
}

// // :: MarkdownParser
// // A parser parsing unextended [CommonMark](http://commonmark.org/),
// // without inline HTML, and producing a document in the basic schema.
// export const tokens = {
//   // ordered_list: { block: 'ordered_list', getAttrs: token => ({ order: +token.attrGet('start') || 1 }) },
//   // heading: { block: 'heading', getAttrs: token => ({ level: +token.tag.slice(1) }) },
//   // fence: { block: 'code_block', getAttrs: token => ({ params: token.info || '' }) },
//   // hr: { node: 'horizontal_rule' },
//   // image: { node: 'image',
//   //   getAttrs: token => ({
//   //     src: token.attrGet('src'),
//   //     title: token.attrGet('title') || null,
//   //     alt: token.children[0] && token.children[0].content || null
//   //   }) },
//   // hardbreak: { node: 'hard_break' },
