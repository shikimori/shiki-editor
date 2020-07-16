// based on
// https://github.com/scrumpy/tiptap/blob/master/packages/tiptap/src/Utils/Extension.js
export default class Extension {
  constructor(options = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options
    };
  }

  init() {
    return null;
  }

  bindEditor(editor = null) {
    this.editor = editor;
  }

  get name() {
    return null;
  }

  get type() {
    return 'extension';
  }

  get plugins() {
    return [];
  }

  inputRules() {
    return [];
  }

  pasteRules() {
    return [];
  }

  keys() {
    return {};
  }

  destroy() {
  }
}
