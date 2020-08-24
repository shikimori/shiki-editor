// import { Plugin, PluginKey } from 'prosemirror-state';
import { Extension } from '../base';
import { bind } from 'shiki-decorators';

export default class ShikiSearch extends Extension {
  editor = null

  _cancel = null
  _pick = null

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

    this.stub();
    this.globalSearch.focus();
  }

  stub() {
    this._cancel = this.globalSearch.cancel;
    this._pick = this.globalSearch.pick;

    this.globalSearch.isStubbedSearchMode = true;
    this.globalSearch.cancel = this.searchCancel;
    this.globalSearch.pick = this.searchPick;
  }

  unstub() {
    this.globalSearch.isStubbedSearchMode = false;
    this.globalSearch.cancel = this._cancel;
    this.globalSearch.pick = this._pick;

    this._cancel = null;
    this._pick = null;
    this._isIndexDisabled = null;
  }

  @bind
  searchCancel() {
    this.unstub();
    this.globalSearch.cancel();

    this.editor.focus();
  }

  @bind
  searchPick(node) {
    console.log(node);
  }
}
