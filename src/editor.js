// https://github.com/scrumpy/tiptap/blob/v1/packages/tiptap/src/Editor.js

import { bind } from 'shiki-decorators';

import uEvent from 'uevent';
import { history, undo, redo } from 'prosemirror-history';
import { EditorState, TextSelection, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { inputRules } from 'prosemirror-inputrules';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';

import {
  ExtensionManager,
  getMarkAttrs,
  getNodeAttrs,
  minMax
} from './utils';
import { MarkdownParser, MarkdownSerializer, MarkdownTokenizer } from './markdown';
import {
  buildNodesAndMarks,
  preventTransformPastedInsideCodeMark,
  smartCommandSpoilerPlugin,
  fixExtraNewLineBeforeBlockInPasted,
  // trackFocus,
  uploadPlaceholder
} from './plugins';
import {
  arrowRightCommand,
  arrowLeftCommand,
  backspaceCommand,
  enterCommand
} from './key_commands';
import { buildExtensions } from './extensions';

export default class Editor {
  options = {
    element: document.createElement('div'),
    autofocus: null,
    shikiRequest: null,
    localizationField: 'name',
    content: '',
    dropCursor: {},
    extensions: [],
    plugins: [],
    editorProps: {}
  }

  constructor(options) {
    uEvent.mixin(this);

    this.options = {
      ...this.options,
      ...options
    };

    this.extensionManager = this.createExtensionManager();

    this.nodes = this.createNodes();
    this.marks = this.createMarks();
    this.schema = this.createSchema();

    this.markdownParser = this.createMarkdownParser();
    this.markdownSerializer = this.createMarkdownSerializer();

    this.keymaps = this.createKeymaps();
    this.inputRules = this.createInputRules();
    this.pasteRules = this.createPasteRules();

    this.createView();

    this.commands = this.createCommands();
    this.activeChecks = this.createActiveChecks();

    this.setActiveNodesAndMarks();

    if (this.options.autoFocus != null) {
      this.focus(this.options.autoFocus);
    }

    // give extension manager access to our view
    this.extensionManager.view = this.view;
  }

  get state() {
    return this.view.state;
  }

  get selection() {
    return this.state.selection;
  }

  get isDestroyed() {
    return !this.view?.docView;
  }

  createExtensionManager() {
    return new ExtensionManager([
      ...buildNodesAndMarks(this),
      ...buildExtensions(this),
      ...this.options.extensions
    ], this);
  }

  createNodes() {
    return this.extensionManager.nodes;
  }

  createMarks() {
    return this.extensionManager.marks;
  }

  createSchema() {
    const schema = new Schema({
      topNode: 'doc',
      nodes: this.nodes,
      marks: this.marks
    });

    Object.keys(this.marks).forEach(name => {
      if (this.marks[name].rank) {
        schema.marks[name].rank = this.marks[name].rank;
      }
    });

    return schema;
  }

  createMarkdownParser() {
    return new MarkdownParser(
      this.schema,
      MarkdownTokenizer,
      this.extensionManager.markdownParserTokens()
    );
  }

  createMarkdownSerializer() {
    const { nodes, marks } = this.extensionManager.markdownSerializerTokens();
    return new MarkdownSerializer(nodes, marks);
  }

  createKeymaps() {
    return this.extensionManager.keymaps({
      schema: this.schema
    });
  }

  createInputRules() {
    return this.extensionManager.inputRules({
      schema: this.schema,
      excludedExtensions: this.options.disableInputRules
    });
  }

  createPasteRules() {
    return this.extensionManager.pasteRules({
      schema: this.schema,
      excludedExtensions: this.options.disablePasteRules
    });
  }

  createView() {
    this.view = new EditorView(this.options.element, {
      ...this.options.editorProps,
      state: this.createState(),
      dispatchTransaction: this.dispatchTransaction
    });

    // `editor.view` is not yet available at this time.
    // Therefore we will add all plugins and node views directly afterwards.
    const newState = this.state.reconfigure({
      plugins: this.createPlugins()
    });

    this.view.updateState(newState);

    this.createNodeViews();
  }

  createState(content = this.options.content) {
    const doc = this.markdownParser.parse(content);

    return EditorState.create({ doc, plugins: [] });
  }

  createPlugins() {
    return [
      ...this.extensionManager.plugins,
      ...this.options.plugins,
      history(),
      inputRules({ rules: this.inputRules }),
      ...this.pasteRules,
      ...this.keymaps,
      keymap({
        'Mod-z': undo,
        'Shift-Mod-z': redo,
        'Mod-y': redo,
        'Mod-s': smartCommandSpoilerPlugin(this),
        Enter: enterCommand,
        ArrowRight: arrowRightCommand,
        ArrowLeft: arrowLeftCommand(),
        Backspace: backspaceCommand
      }),
      keymap(baseKeymap),
      dropCursor(this.options.dropCursor),
      gapCursor(),
      // trackFocus(this),
      preventTransformPastedInsideCodeMark(this),
      fixExtraNewLineBeforeBlockInPasted(),
      uploadPlaceholder,
      new Plugin({
        props: this.options.editorProps
      })
    ];
  }

  createNodeViews() {
    this.view.setProps({
      nodeViews: this.extensionManager.nodeViews()
    });
  }

  createCommands() {
    return this.extensionManager.commands({
      schema: this.schema,
      view: this.view
    });
  }

  createActiveChecks() {
    return this.extensionManager.activeChecks({
      schema: this.schema,
      view: this.view
    });
  }

  setContent(content, isEmitUpdate = false, isAaddToHistory = true) {
    const { doc, tr } = this.state;
    const document = this.markdownParser.parse(content);
    const selection = TextSelection.create(doc, 0, doc.content.size);
    const transaction = tr
      .setSelection(selection)
      .replaceSelectionWith(document, false)
      .setMeta('addToHistory', isAaddToHistory)
      .setMeta('preventUpdate', !isEmitUpdate);

    this.view.dispatch(transaction);
  }

  setActiveNodesAndMarks() {
    this.activeMarkAttrs = Object
      .entries(this.schema.marks)
      .reduce((memo, [name, mark]) => ({
        ...memo,
        [name]: getMarkAttrs(mark, this.state)
      }), {});
  }

  getMarkAttrs(type = null) {
    return this.activeMarkAttrs[type];
  }

  getNodeAttrs(type = null) {
    return {
      ...getNodeAttrs(this.state, this.schema.nodes[type])
    };
  }

  setOptions(options) {
    this.options = {
      ...this.options,
      ...options
    };
  }

  @bind
  dispatchTransaction(transaction) {
    const state = this.state.apply(transaction);
    const selectionHasChanged = !this.state.selection.eq(state.selection);

    this.view.updateState(state);

    if (selectionHasChanged) {
      this.trigger('selectionUpdate', { editor: this });
    }

    // provided by uEvent
    this.trigger('transaction', { editor: this, transaction });

    if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
      return;
    }

    this.setActiveNodesAndMarks();

    // const focus = transaction.getMeta('focus');
    // const blur = transaction.getMeta('blur');
    //
    // if (focus) {
    //   this.trigger('focus', { editor: this, event: focus.event });
    // }
    //
    // if (blur) {
    //   this.trigger('blur', { editor: this, event: blur.event });
    // }
    //
    // if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
    //   return;
    // }
    //
    // this.trigger('update', { editor: this, transaction });
  }

  resolveSelection(position = null) {
    if (this.selection && position === null) {
      return this.selection;
    }

    if (position === 'start' || position === true) {
      return {
        from: 0,
        to: 0
      };
    }

    if (position === 'end') {
      const { doc } = this.state;
      return {
        from: doc.content.size,
        to: doc.content.size
      };
    }

    return {
      from: position,
      to: position
    };
  }

  focus(position = null) {
    if ((this.view.focused && position === null) || position === false) {
      return;
    }

    if (position != null) {
      const { from, to } = this.resolveSelection(position);
      this.setSelection(from, to);
    }

    this.view.focus();
    setTimeout(() => {
      if (this.view.focused) { return; }
      this.view.focus();
    }, 10);
  }

  setSelection(from = 0, to = 0) {
    const { doc, tr } = this.state;
    const resolvedFrom = minMax(from, 0, doc.content.size);
    const resolvedEnd = minMax(to, 0, doc.content.size);
    const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd);
    const transaction = tr.setSelection(selection);

    this.view.dispatch(transaction);
  }

  blur() {
    this.view.dom.blur();
  }

  exportMarkdown() {
    return this.markdownSerializer.serialize(this.state.doc).trim();
  }

  registerPlugin(plugin = null, handlePlugins) {
    const plugins = typeof handlePlugins === 'function' ?
      handlePlugins(plugin, this.state.plugins) :
      [plugin, ...this.state.plugins];
    const newState = this.state.reconfigure({ plugins });
    this.view.updateState(newState);
  }

  unregisterPlugin(name = null) {
    if (!name || !this.view.docView) {
      return;
    }

    const newState = this.state.reconfigure({
      plugins: this.state.plugins.filter(plugin => (
        plugin.key !== name && !plugin.key.startsWith(`${name}$`)
      ))
    });
    this.view.updateState(newState);
  }

  destroy() {
    this.view?.destroy();
    this.extensionManager.destroy();
  }
}
