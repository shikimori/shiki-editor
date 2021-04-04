import { Plugin, PluginKey } from 'prosemirror-state';

export default function(editor) {
  return new Plugin({
    key: new PluginKey('track_focus'),
    props: {
      attributes: {
        tabindex: 0
      },
      handleDOMEvents: {
        focus: (view, event) => {
          editor.focused = true;

          // provided by uEvent
          editor.trigger('focus', {
            event,
            state: view.state,
            view
          });

          const transaction = editor.state.tr.setMeta('focused', true);
          editor.view.dispatch(transaction);
        },
        blur: (view, event) => {
          editor.focused = false;

          // provided by uEvent
          editor.trigger('blur', {
            event,
            state: view.state,
            view
          });

          const transaction = editor.state.tr.setMeta('focused', false);
          editor.view.dispatch(transaction);
        }
      }
    }
  });
}
