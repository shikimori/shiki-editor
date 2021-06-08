import { chainCommands, exitCode } from 'prosemirror-commands';
import { Node } from '../base';

export default class HardBreak extends Node {
  get name() {
    return 'hard_break';
  }

  get schema() {
    return {
      attrs: {
        isKeep: { default: false }
      },
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{
        tag: 'br',
        getAttrs: node => ({
          isKeep: node.getAttribute('data-keep') != undefined
        })
      }],
      toDOM: node => [
        'br',
        node.attrs.isKeep ? { 'data-keep': '' } : {}
      ]
    };
  }

  commands({ type }) {
    return () => chainCommands(exitCode, (state, dispatch) => {
      const tr = state.tr.replaceSelectionWith(
        type.create({ isShiftEntered: true })
      );
      dispatch(tr.scrollIntoView());
      return true;
    });
  }

  keys({ type }) {
    return {
      // 'Mod-Enter': command,
      'Shift-Enter': this.commands({ type })()
    };
  }

  markdownSerialize(state, node) {
    const bbcode = node.attrs.isKeep ?
      '[br]' :
      '\n';
    state.write(bbcode);
  }
}
