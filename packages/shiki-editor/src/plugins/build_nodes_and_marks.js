import {
  Blockquote,
  BoldBlock,
  BulltList,
  Center,
  CodeBlock,
  ColorBlock,
  Div,
  Doc,
  Heading,
  Hr,
  Image,
  ItalicBlock,
  LinkBlock,
  ListItem,
  Paragraph,
  Quote,
  Right,
  ShikiBlock,
  ShikiInline,
  SizeBlock,
  Smiley,
  SpoilerBlock,
  Text
} from '../nodes';

import {
  BoldInline,
  CodeInline,
  ColorInline,
  ItalicInline,
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
    new LinkInline(),
    new BoldInline(),
    new ItalicInline(),
    new ColorInline(),
    new SizeInline(),
    new Underline(),
    new Strike(),
    new CodeInline(),
    new Center(),
    new Right(),
    new LinkBlock(),
    new ShikiInline(),
    new BoldBlock(),
    new ItalicBlock(),
    new SizeBlock(),
    new ColorBlock(),
    new ShikiBlock(),
    new Blockquote(),
    new BulltList(),
    new CodeBlock(),
    new Div(),
    new Hr(),
    new Smiley({ origin: editor.options.origin }),
    new Image(),
    new ListItem(),
    new Quote({ origin: editor.options.origin }),
    new SpoilerBlock()
  ];
}
