import { __parseFromClipboard } from 'prosemirror-view';

export default function htmlToNodes(editor, html) {
  const fragment = __parseFromClipboard(
    editor.view,
    null,
    html,
    null,
    editor.view.state.selection.$from
  ).content;

  const markdown = editor.markdownSerializer.serialize(fragment);
  const result = editor.markdownParser.parse(markdown);

  return result.content;
}
