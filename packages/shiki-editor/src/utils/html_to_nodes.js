import { __parseFromClipboard } from 'prosemirror-view';

export default function htmlToNodes(view, html) {
  return __parseFromClipboard(
    view,
    null,
    html,
    null,
    view.state.selection.$from
  ).content;
}
