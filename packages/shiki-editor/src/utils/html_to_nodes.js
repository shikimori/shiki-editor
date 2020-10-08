import { __parseFromClipboard } from 'prosemirror-view';

export default function htmlToNodes(editor, html) {
  return __parseFromClipboard(
    editor.view,
    null,
    html,
    null,
    editor.view.state.selection.$from
  ).content;
}
