export default function smartCommandSpoilerPlugin(editor) {
  return (state, _dispatch, _view) => {
    const contentSize = state.selection.content().content.content.length;
    const command = contentSize > 1 || editor.activeChecks.spoiler_block() ?
      'spoiler_block' :
      'spoiler_inline';

    editor.commands[command]();

    return true;
  };
}
