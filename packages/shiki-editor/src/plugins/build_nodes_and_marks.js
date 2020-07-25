import {
  Blockquote,
  BoldBlock,
  BulltList,
  Center,
  CodeBlock,
  Div,
  Doc,
  Heading,
  Hr,
  Image,
  LinkBlock,
  ListItem,
  Paragraph,
  Quote,
  Right,
  ShikiInline,
  SizeBlock,
  ColorBlock,
  Smiley,
  SpoilerBlock,
  Text
} from '../nodes';

import {
  BoldInline,
  CodeInline,
  ColorInline,
  Italic,
  LinkInline,
  SizeInline,
  SpoilerInline,
  Strike,
  Underline
} from '../marks';

export default function(editor) {
  return [
    new Doc(),
    new Text(),
    new Paragraph(),
    new Heading(),
    new SpoilerInline(), // must be above other marks in order to obtain greater priorirty
    new BoldInline(),
    new Italic(),
    new ColorInline(),
    new SizeInline(),
    new Underline(),
    new Strike(),
    new LinkInline(),
    new CodeInline(),
    new Center(),
    new Right(),
    new LinkBlock(),
    new ShikiInline(),
    new BoldBlock(),
    new SizeBlock(),
    new ColorBlock(),
    new Blockquote(),
    new BulltList(),
    new CodeBlock(),
    new Div(),
    new Hr(),
    new Smiley({ baseUrl: editor.options.baseUrl }),
    new Image(),
    new ListItem(),
    new Quote({ baseUrl: editor.options.baseUrl }),
    new SpoilerBlock()
  ];
}
