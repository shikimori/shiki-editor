// based on https://github.com/ueberdosis/tiptap/blob/master/packages/tiptap-extensions/src/plugins/Suggestions.js
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { insertText } from '../../commands';
import buildDetectSequence from './build_detect_sequence';

export default function buildSuggestionsPopupPlugin({
  matcher = {
    char: '@',
    allowSpaces: false,
    startOfLine: false
  },
  appendText = null,
  suggestionClass = 'ProseMirror-suggestion',
  command = ({ attrs, range, schema }) => false, // eslint-disable-line no-unused-vars
  showed = () => false,
  updated = () => false,
  closedEmpty = () => false,
  closed = () => false,
  keyPresed = () => false
}) {
  const detectSequence = buildDetectSequence(matcher);

  return new Plugin({
    key: new PluginKey('suggestions_popup'),

    view() {
      return {
        update: (view, prevState) => {
          const prev = this.key.getState(prevState);
          const next = this.key.getState(view.state);

          // See how the state changed
          const moved = prev.active && next.active &&
            prev.range.from !== next.range.from;
          const isStarted = !prev.active && next.active;
          const isStopped = prev.active && !next.active;
          const isChanged = !isStarted &&
            !isStopped && prev.query !== next.query && next.active;

          const isHandleShow = isStarted || moved;
          const isHandleUpdate = isChanged; // && !moved;
          const isHandleClose = isStopped || moved;

          // Cancel when suggestion isn't active
          if (!isHandleShow && !isHandleUpdate && !isHandleClose) {
            return;
          }

          // const state = isHandleClose ? prev : next;
          const state = next;
          const decorationNode = document.querySelector(
            `[data-decoration-id="${state.decorationId}"]`
          );

          // build a virtual node for popper.js or tippy.js
          // this can be used for building popups without a DOM node
          const virtualNode = decorationNode ? {
            getBoundingClientRect() {
              return decorationNode.getBoundingClientRect();
            },
            clientWidth: decorationNode.clientWidth,
            clientHeight: decorationNode.clientHeight
          } : null;

          const props = {
            view,
            range: state.range,
            query: state.query,
            text: state.text,
            decorationNode,
            virtualNode,
            command: ({ range, attrs }) => {
              const { state, dispatch } = view;
              const { schema } = state;

              command({ range, attrs, schema })(state, dispatch, view);

              if (appendText) {
                insertText(appendText)(view.state, view.dispatch, view);
              }
            }
          };

          if (isHandleClose) {
            if (props.query) {
              closed(props);
            } else {
              closedEmpty(props);
            }
          }

          if (isHandleUpdate) {
            updated(props);
          }

          if (isHandleShow) {
            showed(props);
          }
        }
      };
    },

    state: {
      // Initialize the plugin's internal state.
      init() {
        return {
          active: false,
          disable: false,
          range: {},
          query: null,
          text: null
        };
      },

      // Apply changes to the plugin state from a view transaction.
      apply(tr, prev) {
        // if (prev.disable === true) { debugger }
        // if (prev.query) { debugger }

        const { selection } = tr;
        const next = { ...prev };

        // if (tr.meta.suggestions_popup?.disable) {
        //   next.active = true;
        // }

        // We can only be suggesting if there is no selection
        if (next.disable !== true && selection.from === selection.to) {
          // Reset active state if we just left the previous suggestion range
          if (selection.from < prev.range.from || selection.from > prev.range.to) {
            next.active = false;
          }

          // Try to match against where our cursor currently is
          const $position = selection.$from;
          const match = detectSequence($position);
          const decorationId = (Math.random() + 1).toString(36).substr(2, 5);

          // If we found a match, update the current state to show it
          if (match && match.query) {
            next.active = true;
            next.decorationId = prev.decorationId ?
              prev.decorationId :
              decorationId;
            next.range = match.range;
            next.query = match.query;
            next.text = match.text;
          } else {
            next.active = false;
          }
        } else {
          next.active = false;
        }

        // Make sure to empty the range if suggestion is inactive
        if (!next.active) {
          next.decorationId = null;
          next.range = {};
          next.query = null;
          next.text = null;
        }

        if (next.active && matcher.allowSpaces && (
          next.text.endsWith('  ') || next.text.split(' ').length > 3
        )) {
          next.active = false;
        }

        return next;
      }
    },

    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(view, event) {
        const state = this.getState(view.state);
        const { active, range } = state;

        if (!active) return false;

        // if (event.key === 'Escape') {
        //   // state.disabled = true;
        //
        //   view.dispatch(
        //     view.state.tr.setMeta(
        //       'suggestions_popup',
        //       { fromPos: range.from, toPos: range.to, disable: true }
        //     )
        //   );
        //   return;
        // }

        return keyPresed({ view, event, range });
      },

      // Setup decorator on the currently active suggestion.
      decorations(editorState) {
        const { active, range, decorationId } = this.getState(editorState);

        if (!active) return null;

        return DecorationSet.create(editorState.doc, [
          Decoration.inline(range.from, range.to, {
            nodeName: 'span',
            class: suggestionClass,
            'data-decoration-id': decorationId
          })
        ]);
      }
    }
  });
}
