import { bind } from 'shiki-decorators';

import { Extension } from '../base';
import { scrollTop } from '../utils';
import { addToShikiCache } from '../extensions';
import sourceCommand from '../components/utils/source_command';

export default class ShikiSearch extends Extension {
  editor = null

  _cancel = null
  _pick = null
  scrollY = 0

  get name() {
    return 'shiki_search';
  }

  get defaultOptions() {
    return {
      globalSearch: null,
      editorApp: null
    };
  }

  get globalSearch() {
    return this.options.globalSearch;
  }

  get editorApp() {
    return this.options.editorApp;
  }

  searchOpen(editor) {
    this.editor = editor;
    this.scrollY = scrollTop();

    this._stub();
    this.globalSearch.focus();
  }

  @bind
  searchClose() {
    this._unstub();
    this.globalSearch.cancel();

    this.editor.focus();
    window.scrollTo(0, this.scrollY);
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

    if (!attrs.id) {
      return;
    }

    if (this.editorApp.isSource) {
      sourceCommand(this.editorApp, 'shiki_link', attrs);
    } else {
      this._editorCommand(attrs);
    }
    addToShikiCache(attrs.type, attrs.id, attrs);
  }

  _editorCommand(attrs) {
    const { state, schema, selection } = this.editor;
    const { dispatch } = this.editor.view;

    let tr;
    const mark = schema.marks.link_inline.create(attrs, null, []);

    if (selection.from === selection.to) {
      const editorNode = schema.text(attrs.text, [mark]);
      tr = state.tr.replaceWith(selection.from, selection.to, editorNode);
    } else {
      tr = state.tr.addMark(selection.from, selection.to, mark);
    }

    dispatch(tr);
  }

  _stub() {
    this._cancel = this.globalSearch.cancel;
    this._pick = this.globalSearch.pick;

    this.globalSearch.isStubbedSearchMode = true;
    this.globalSearch.cancel = this.searchClose;
    this.globalSearch.pick = this.searchPick;
  }

  _unstub() {
    this.globalSearch.isStubbedSearchMode = false;
    this.globalSearch.cancel = this._cancel;
    this.globalSearch.pick = this._pick;

    this._cancel = null;
    this._pick = null;
    this._isIndexDisabled = null;
  }
}
