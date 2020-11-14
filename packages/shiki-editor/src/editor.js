// based on https://github.com/scrumpy/tiptap/blob/master/packages/tiptap/src/Editor.js

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
import { MarkdownParser, MarkdownSerializer, MarkdownTokenizer }
  from './markdown';
import { VueView } from './node_views';
import {
  buildNodesAndMarks,
  preventTransformPastedInsideCodeMark,
  trackFocus,
  uploadPlaceholder
} from './plugins';
import { joinBackwardEnhanced } from './commands';
import { buildExtensions } from './extensions';

export default class ShikiEditor {
  options = {
    autofocus: null,
    shikiRequest: null,
    localizationField: 'name',
    content: '',
    dropCursor: {},
    extensions: [],
    plugins: [],
    editorProps: {}
  }

  constructor(options, vueComponent, Vue) {
    uEvent.mixin(this);

    this.vueComponent = vueComponent;
    this.Vue = Vue;

    this.init(options);
  }

  get state() {
    return this.view.state;
  }

  get selection() {
    return this.state.selection;
  }

  init(options = {}) {
    this.options = {
      ...this.options,
      ...options
    };

    this.focused = false;

    this.extensionsManager = this.createExtensionManager();
    this.element = this.options.element || document.createElement('div');

    this.nodes = this.createNodes();
    this.marks = this.createMarks();
    this.schema = this.createSchema();

    this.markdownParser = this.createMarkdownParser();
    this.markdownSerializer = this.createMarkdownSerializer();

    this.keymaps = this.createKeymaps();
    this.inputRules = this.createInputRules();
    this.pasteRules = this.createPasteRules();
    this.view = this.createView();

    this.commands = this.createCommands();
    this.activeChecks = this.createActiveChecks();

    this.plugins = this.createPlugins();
    this.attachPlugins();

    this.setActiveNodesAndMarks();

    if (this.options.autoFocus != null) {
      this.focus(this.options.autoFocus);
    }

    // give extension manager access to our view
    this.extensionsManager.view = this.view;
  }

  createExtensionManager() {
    return new ExtensionManager([
      ...buildNodesAndMarks(this),
      ...buildExtensions(this),
      ...this.options.extensions
    ], this);
  }

  createNodes() {
    return this.extensionsManager.nodes;
  }

  createMarks() {
    return this.extensionsManager.marks;
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
      this.extensionsManager.markdownParserTokens()
    );
  }

  createMarkdownSerializer() {
    const { nodes, marks } = this.extensionsManager.markdownSerializerTokens();
    return new MarkdownSerializer(nodes, marks);
  }

  createKeymaps() {
    return this.extensionsManager.keymaps({
      schema: this.schema
    });
  }

  createInputRules() {
    return this.extensionsManager.inputRules({
      schema: this.schema,
      excludedExtensions: this.options.disableInputRules
    });
  }

  createPasteRules() {
    return this.extensionsManager.pasteRules({
      schema: this.schema,
      excludedExtensions: this.options.disablePasteRules
    });
  }

  createView() {
    return new EditorView(this.element, {
      state: this.createState(),
      dispatchTransaction: this.dispatchTransaction,
      nodeViews: this.initNodeViews({
        parent: this.element,
        extensions: this.extensionsManager.extensions
      }, false)
    });
  }

  createState(content = this.options.content) {
    return EditorState.create({
      schema: this.schema,
      doc: this.markdownParser.parse(content),
      plugins: []
    });
  }

  createPlugins() {
    return [
      ...this.extensionsManager.plugins,
      ...this.options.plugins,
      history(),
      inputRules({ rules: this.inputRules }),
      ...this.pasteRules,
      ...this.keymaps,
      keymap({
        'Mod-z': undo,
        'Shift-Mod-z': redo,
        'Mod-y': redo,
        Backspace: joinBackwardEnhanced
      }),
      keymap(baseKeymap),
      dropCursor(this.options.dropCursor),
      gapCursor(),
      trackFocus(this),
      preventTransformPastedInsideCodeMark,
      uploadPlaceholder,
      new Plugin({
        props: this.options.editorProps
      })
    ];
  }

  attachPlugins() {
    this.view.updateState(
      this.state.reconfigure({ plugins: this.plugins })
    );
  }

  createCommands() {
    return this.extensionsManager.commands({
      schema: this.schema,
      view: this.view
    });
  }

  createActiveChecks() {
    return this.extensionsManager.activeChecks({
      schema: this.schema,
      view: this.view
    });
  }

  initNodeViews({ parent, extensions }, isVue) {
    return extensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => (
        extension.view && (isVue || extension.view.constructor === Function)
      ))
      .reduce((nodeViews, extension) => {
        const nodeView = (node, view, getPos, decorations) => {
          if (extension.view.constructor === Function) {
            return extension.view({
              editor: this,
              extension,
              node,
              view,
              getPos,
              decorations
            });
          }
          const component = extension.view;

          return new VueView(component, {
            editor: this,
            extension,
            parent,
            node,
            view,
            getPos,
            decorations
          }, this.Vue);
        };

        return {
          ...nodeViews,
          [extension.name]: nodeView
        };
      }, {});
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

  setParentComponent(component = null) {
    if (!component) { return; }

    this.view.setProps({
      nodeViews: this.initNodeViews({
        parent: component,
        extensions: this.extensionsManager.extensions
      }, true)
    });
  }

  @bind
  dispatchTransaction(transaction) {
    const { state } = this.state.applyTransaction(transaction);
    this.view.updateState(state);

    if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
      return;
    }

    this.setActiveNodesAndMarks();

    this.trigger('update', { transaction });
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

    const { from, to } = this.resolveSelection(position);

    this.setSelection(from, to);
    setTimeout(() => this.view.focus(), 10);
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
    this.extensionsManager.destroy();
  }
}
