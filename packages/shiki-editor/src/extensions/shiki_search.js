// import { Plugin, PluginKey } from 'prosemirror-state';
import { Extension } from '../base';

export default class ShikiSearch extends Extension {
  editor = null

  _cancel = null
  _pick = null
  _isIndexDisabled = null

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
    this._cancel = globalSearch.cancel;
    this._pick = globalSearch.pick;
    this._isIndexDisabled = globalSearch.isIndexDisabled;

    globalSearch.isIndexDisabled = true;
    globalSearch.isStubbedSearchMode = true;

    globalSearch.cancel = this.cancel;
    globalSearch.pick = this.pick;
  }

  cancel() {
    this.globalSearch.cancel = this._cancel;
    this.globalSearch.isIndexDisabled = this._isIndexDisabled;
    this.globalSearch.isStubbedSearchMode = false;
    this.globalSearch.cancel();

    this.editor.focus();
  }

  pick(node) {
    console.log(node);
  }
}
