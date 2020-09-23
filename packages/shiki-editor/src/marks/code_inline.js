import { Mark } from '../base';
import { markInputRule, markPasteRule } from '../commands';

export default class CodeInline extends Mark {
  get name() {
    return 'code_inline';
  }

  get schema() {
    return {
      parseDOM: [{ tag: 'code' }],
      toDOM: () => ['code', { class: 'b-code_inline' }]
    };
  }

  keys({ type }) {
    return {
      'Mod-o': (state, dispatch) => this.commands({ type })()(state, dispatch)
    };
  }

  inputRules({ type }) {
    return [
      markInputRule(/(?:`)([^`]+)(?:`)$/, type)
    ];
  }

  pasteRules({ type }) {
    return [
      markPasteRule(/(?:`)([^`]+)(?:`)/g, type)
    ];
  }

  get markdownSerializerToken() {
    return {
      open(_state, _mark, parent, index) {
        return backticksFor(parent.child(index));
      },
      close(_state, _mark, parent, index) {
        return backticksFor(parent.child(index - 1));
      },
      escape: false
    };
  }
}

function backticksFor(node) {
  const ticks = /`+/g;
  let m;
  let len = 0;

  if (node.isText) {
    while (m = ticks.exec(node.text)) { // eslint-disable-line
      len = Math.max(len, m[0].length);
    }
  }
  let result = '`';
  for (let i = 0; i < len; i += 1) result += '`';
  return result;
}
