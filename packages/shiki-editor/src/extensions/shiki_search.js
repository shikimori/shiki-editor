import { bind } from 'shiki-decorators';

import { Extension } from '../base';
import { getShikiLoader } from '../utils';

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

  searchOpen(editor) {
    this.editor = editor;

    this.stub();
    this.globalSearch.focus();
  }

  stub() {
    this._cancel = this.globalSearch.cancel;
    this._pick = this.globalSearch.pick;

    this.globalSearch.isStubbedSearchMode = true;
    this.globalSearch.cancel = this.searchClose;
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
  searchClose() {
    this.unstub();
    this.globalSearch.cancel();

    this.editor.focus();
  }

  @bind
  searchPick(domNode) {
    this.searchClose();

    const attrs = {
      id: domNode.getAttribute('data-id'),
      text: domNode.getAttribute('data-text'),
      type: domNode.getAttribute('data-type'),
      url: domNode.getAttribute('data-url')
    };
    const { state, schema, selection } = this.editor;
    const { dispatch } = this.editor.view;

    const editorNode = schema.text(
      attrs.text,
      [schema.marks.link_inline.create(attrs, null, [])]
    );

    dispatch(state.tr.replaceWith(selection.from, selection.to, editorNode));
    getShikiLoader(this.editor).addToCache(attrs.type, attrs.id, attrs, true);
  }
}
