// import { Plugin, PluginKey } from 'prosemirror-state';
import { Extension } from '../base';

export default class ShikiSearch extends Extension {
  editor = null

  get name() {
    return 'shiki_search';
  }

  get defaultOptions() {
    return {
      globalSeach: null
    };
  }

  get globalSearch() {
    return this.options.globalSearch;
  }

  activate(editor) {
    this.editor = editor;

    this.stub(this.globalSearch);
    this.globalSearch.focus();
  }

  stub(globalSearch) {
    const _cancel = globalSearch.cancel;
    const _isIndexDisabled = globalSearch.isIndexDisabled;

    globalSearch.isIndexDisabled = true;

    globalSearch.cancel = () => {
      globalSearch.cancel = _cancel;
      globalSearch.isIndexDisabled = _isIndexDisabled;
      globalSearch.cancel();

      this.editor.focus();
    };
  }
}
