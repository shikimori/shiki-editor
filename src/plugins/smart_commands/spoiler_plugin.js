export default function smartCommandSpoilerPlugin(editor) {
  return (state, _dispatch, _view) => {
    const contentSize = state.selection.content().content.content.length;
    const command = contentSize > 1 ? 'spoiler_block' : 'spoiler_inline';

    return editor.commands[command]();
  };
}
