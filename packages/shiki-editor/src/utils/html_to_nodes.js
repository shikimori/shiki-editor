import { DOMParser } from 'prosemirror-model';

export default function htmlToNodes(editor, html) {
  const nodes = DOMParser.fromSchema(editor.schema).parse(html);
  debugger
  console.log(html);
  console.log(nodes);

  return nodes.content?.content?.[0]?.type?.name === 'paragraph' ?
    nodes.content.content[0].content :
    nodes.content;
}

