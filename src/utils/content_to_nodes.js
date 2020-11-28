export default function contentToNodes(editor, content) {
  const nodes = editor.markdownParser.parse(content);

  return nodes.content?.content?.[0]?.type?.name === 'paragraph' ?
    nodes.content.content[0].content :
    nodes.content;
}
