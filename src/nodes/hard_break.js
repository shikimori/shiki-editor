import { chainCommands, exitCode } from 'prosemirror-commands';
import { Node } from '../base';

export default class HardBreak extends Node {
  get name() {
    return 'hard_break';
  }

  get schema() {
    return {
      attrs: {
        isPasted: { default: false },
        isTyped: { default: false }
      },
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [
        {
          tag: 'br',
          getAttrs: _node => ({ isPasted: true })
        }
      ],
      toDOM: () => ['br']
    };
  }

  commands({ type }) {
    return () => chainCommands(exitCode, (state, dispatch) => {
      const tr = state.tr.replaceSelectionWith(type.create({ isTyped: true }));
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
    state.write(node.attrs.isPasted || node.attrs.isTyped ? '\n' : '[br]');
  }
}
