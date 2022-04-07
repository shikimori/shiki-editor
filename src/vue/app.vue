<template>
  <div>
    <div
      ref='menubar'
      class='menubar'
      :class='{ "is-sticky-menu-offset": isStickyMenuOffset }'
    >
      <div v-if='editor' v-dragscroll class='icons'>
        <div
          v-for='([group, items], index) in menuItems'
          :key='index'
          class='menu_group'
          :class='{
            [`menu_group-${group}`]: true,
            "is-active": activeMobileMenuGroup === group,
            "is-hidden": activeMobileMenuGroup && activeMobileMenuGroup !== group
          }'
        >
          <button
            class='mobile_placeholder'
            :class='{
              [`mobile_placeholder-${group}`]: true,
              "is-active": activeMobileMenuGroup === group
            }'
            @click='(e) => toggleMobileMenuGroup(group, e)'
          />
          <Icon
            v-for='item in items'
            :key='item.constructor === Object ? item.type : item'
            :ref='item.type'
            v-bind='item'
            :is-active='nodesState[item.type] && !isSource'
            :is-enabled='item.isEditingEnabled'
            @command='args => command(item.type, args)'
          />
        </div>
        <div class='menu_group menu_group-controls'>
          <div
            v-if='isPreviewLoading'
            class='icon-loader b-ajax vk-like'
          />
          <Icon
            v-bind='menuPreviewItem'
            is-button
            :is-active='isPreview'
            :is-enabled='isPreviewEnabled'
            @command='() => togglePreview()'
          />
          <Icon
            v-bind='menuSourceItem'
            is-button
            :is-active='isSource'
            :is-enabled='isSourceEnabled'
            :is-disabled='isSourceDisabled'
            @command='() => toggleSource()'
          />
        </div>
      </div>
    </div>

    <!--
    {{ editor.selection.$from.pos }} - {{ editor.selection.$to.pos }}
    -->

    <div
      v-if='unsavedContent'
      class='unsaved-content'
    >
      {{ i18n_t('frontend.shiki_editor.unsaved_content.label') }}
      <button
        class='b-button'
        @click.prevent='applyUnsavedContent'
      >
        {{ i18n_t('frontend.shiki_editor.unsaved_content.yes') }}
      </button>
      <button
        class='b-button'
        @click.prevent='discardUnsavedContent'
      >
        {{ i18n_t('frontend.shiki_editor.unsaved_content.no') }}
      </button>
      <div
        class='b-spoiler_block'
        :class='{ "is-opened": isUnsavedContentExpanded }'
      >
        <span
          ref='unsavedContentSpoiler'
          tabindex='0'
          @click='toggleUnsavedConent'
        >
          {{
            i18n_t('frontend.shiki_editor.unsaved_content.draft')
          }}
        </span>
        <div>{{ unsavedContent }}</div>
      </div>
    </div>
    <div
      v-if='editor'
      ref='editor_container'
      class='editor-container'
      :class='{
        "is-loading": isPreviewLoading,
        "is-source": isSource && !isPreview
      }'
    >
      <div
        v-if='isPreview && previewHTML != null'
        ref='preview'
        class='preview'
        v-html='previewHTML'
      />
      <textarea
        v-else-if='isSource'
        ref='textarea'
        v-model='editorContent'
        class='ProseMirror'
        @keydown='handleSourceKeypress'
        @keyup='detectHugeContent'
        @change='detectHugeContent'
        @paste='detectHugeContent'
      />
      <EditorContent
        v-else
        :editor='editor'
      />
    </div>

    <Smileys
      v-show='isSmiley && !isPreview'
      ref='smileys'
      :is-enabled='isSmiley'
      target-ref='smiley'
      :shiki-request='shikiRequest'
      :is-sticky-menu-offset='isStickyMenuOffset'
      @toggle='smileyCommand'
    />
    <Colors
      v-show='isColor && !isPreview'
      :is-enabled='isColor'
      target-ref='color'
      :is-sticky-menu-offset='isStickyMenuOffset'
      @toggle='colorCommand'
    />
    <Suggestions
      :is-available='isEditingEnabled'
      :editor='editor'
      :shiki-request='shikiRequest'
    />
  </div>
</template>

<script>
import { watch } from 'vue';
import autosize from 'autosize';
import withinviewport from '@morr/withinviewport';
import { dragscrollNext } from 'vue-dragscroll';
import delay from 'delay';
import { set } from 'text-field-edit';

import { keymap } from 'prosemirror-keymap';
import { undo, redo } from 'prosemirror-history';

import VueEditor from './editor';
import { EditorContent } from './editor_content';
import sourceCommand from './utils/source_command';
import { contentToNodes, scrollTop } from '../utils';
import { FileUploader, ShikiSearch } from '../extensions';
import { insertReply, insertFragment, insertQuote } from '../commands';
import { preventHugePaste } from '../plugins';

import { flash } from 'shiki-utils';

import Icon from './components/icon';
import Smileys from './components/smileys';
import Colors from './components/colors';
import Suggestions from './components/suggestions';

const MENU_ITEMS = {
  inline: [
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'spoiler_inline',
    'code_inline',
    'link'
  ],
  history: ['undo', 'redo'],
  item: ['smiley', 'image', 'shiki_link', 'upload'],
  block: ['blockquote', 'spoiler_block', 'code_block', 'bullet_list']
};
const MAXIMUM_CONTENT_SIZE = 100000;

const DEFAULT_DATA = {
  isSource: false,
  isItalicBlock: false,
  isBoldBlock: false,
  isLinkBlock: false,
  isSmiley: false,
  isColor: false,
  isColorBlock: false,
  isPreview: false,
  isPreviewLoading: false,
  previewHTML: null,
  isHugeContent: false,
  activeMobileMenuGroup: null
};

export default {
  name: 'EditorApp',
  directives: {
    dragscroll: dragscrollNext
  },
  components: {
    EditorContent,
    Icon,
    Smileys,
    Colors,
    Suggestions
  },
  inheritAttrs: false,
  props: {
    shikiRequest: { type: Object, required: true },
    content: { type: String, required: true },
    shikiUploader: { type: Object, required: true },
    globalSearch: { type: Object, required: false, default: undefined },
    localizationField: {
      type: String,
      required: true,
      validator: (value) => (['name', 'russian'].indexOf(value) !== -1)
    },
    previewParams: { type: Object, required: false, default: undefined }
  },
  emits: ['preview', 'submit'],
  data: () => ({
    editor: null,
    editorContent: null,
    editorPosition: null,
    unsavedContent: null,
    nodesState: {},
    isUnsavedContentExpanded: false,
    ...DEFAULT_DATA
  }),
  computed: {
    isEditingEnabled() {
      return !this.isSource && !this.isPreview;
    },
    isEditingEnabledMappings() {
      return {
        undo: this.undoIsEnabled,
        redo: this.redoIsEnabled
        // link: this.linkIsEnabled
      };
    },
    menuItems() {
      return Object.keys(MENU_ITEMS).map(group => (
        [
          group,
          MENU_ITEMS[group].map(item => ({
            type: item,
            title: window.I18n.t(`frontend.shiki_editor.${item}`),
            isEditingEnabled: this.isEditingEnabledMappings[item] ?? !this.isPreview
          }))
        ]
      ));
    },
    menuPreviewItem() {
      return {
        type: 'preview',
        title: window.I18n.t('frontend.shiki_editor.preview')
      };
    },
    menuSourceItem() {
      return {
        type: 'source',
        title: window.I18n.t('frontend.shiki_editor.source')
      };
    },
    isContentManipulationsPending() {
      return this.fileUploaderExtension.isUploading;
    },
    isPreviewEnabled() {
      return !this.isContentManipulationsPending;
    },
    isSourceEnabled() {
      return !this.isHugeContent &&
          !this.isContentManipulationsPending;
      // !this.isContentManipulationsPending && !this.isPreview;
    },
    isSourceDisabled() {
      return this.isPreview || this.isContentManipulationsPending;
    },
    undoIsEnabled() {
      return this.isEditingEnabled && undo(this.editor.state);
    },
    redoIsEnabled() {
      return this.isEditingEnabled && redo(this.editor.state);
    },
    fileUploaderExtension() {
      return new FileUploader({
        editorApp: this,
        shikiUploader: this.shikiUploader
      });
    },
    shikiSearchExtension() {
      if (!this.globalSearch) {
        return null;
      }

      return new ShikiSearch({
        editorApp: this,
        globalSearch: this.globalSearch
      });
    },
    isStickyMenuOffset() {
      const topMenuNode = document.querySelector('.l-top_menu-v2');
      if (!topMenuNode) {
        return false;
      }

      return getComputedStyle(topMenuNode).position === 'sticky';
    }
  },
  created() {
    this.createEditor();
  },
  beforeUnmount() {
    this.editor.destroy();
  },
  methods: {
    async detectHugeContent() {
      await Promise.all([delay(100), this.$nextTick()]);
      const contentSize = this.editorContent.length;

      if (!this.isHugeContent && contentSize > MAXIMUM_CONTENT_SIZE) {
        this.activateHugeContent();
      } else if (this.isHugeContent && contentSize <= MAXIMUM_CONTENT_SIZE) {
        this.disableHugeContent();
      }
    },
    async activateHugeContent() {
      this.isHugeContent = true;
      await this.$nextTick();
      flash.info(window.I18n.t('frontend.shiki_editor.huge_content_mode'));
    },
    async disableHugeContent() {
      this.isHugeContent = false;
      await this.$nextTick();
      flash.info(window.I18n.t('frontend.shiki_editor.normal_content_mode'));
    },
    focus(editorPosition = undefined) {
      if (this.isSource) {
        this.$refs.textarea.focus();
      } else {
        this.editor.focus(editorPosition);
      }
    },
    command(type, args) {
      this.toggleMobileMenuGroup(null);

      const prefix = type
        .split('_')
        .map((word, index) => (
          index ? `${word[0].toUpperCase()}${word.slice(1)}` : word
        ))
        .join('');
      const method = `${prefix}Command`;

      if (this[method] && this[method].constructor === Function) {
        return this[method](args);
      }

      if (this.isSource) {
        return sourceCommand(this, type, args);
      }

      switch (type) {
        case 'link':
          this.isLinkBlock ?
            this.editor.commands.link_block() :
            this.editor.commands.link_inline();
          break;

        case 'bold':
          this.isBoldBlock ?
            this.editor.commands.bold_block() :
            this.editor.commands.bold_inline();
          break;

        case 'italic':
          this.isItalicBlock ?
            this.editor.commands.italic_block() :
            this.editor.commands.italic_inline();
          break;

        default:
          this.editor.commands[type](args);
      }
    },
    undoCommand() {
      undo(this.editor.state, this.editor.view.dispatch);
      this.focus();
    },
    redoCommand() {
      redo(this.editor.state, this.editor.view.dispatch);
      this.focus();
    },
    smileyCommand(kind) {
      this.isSmiley = !this.isSmiley;

      if (kind) {
        if (this.isSource) {
          sourceCommand(this, 'smiley', kind);
        } else {
          this.editor.commands.smiley(kind);
        }
      }
    },
    colorCommand(params = {}) {
      if (params.isClosed) {
        this.isColor = false;
        return;
      }

      if (params.color) {
        this.isColor = !this.isColor;

        if (this.isSource) {
          sourceCommand(this, this.isColorBlock ? 'color_block' : 'color_inline', params);
        } else {
          if (this.isColorBlock) {
            this.editor.commands.color_block(params);
          } else {
            this.editor.commands.color_inline(params);
          }
        }
      } else {
        this.isColor = !this.nodesState.color;

        if (!this.isColor) {
          this.isColor = false;

          if (this.isColorBlock) {
            this.editor.commands.color_block(null, true);
          } else {
            this.editor.commands.color_inline();
          }
        }
      }
    },
    shikiLinkCommand() {
      if (!this.shikiSearchExtension) {
        alert('globalSearch prop is missing');
        return;
      }
      this.shikiSearchExtension.searchOpen(this.editor);
    },
    uploadCommand(files) {
      this.fileUploaderExtension.addFiles(files);
    },
    appendReply(reply) {
      const { editor } = this;
      insertReply(reply)(editor.state, editor.view.dispatch);
      this.focus();
    },
    appendQuote(quote) {
      const { editor } = this;
      insertQuote(quote, editor)(editor.state, editor.view.dispatch);
      this.focus();
    },
    appendText(content) {
      const fragment = contentToNodes(this.editor, content);
      insertFragment(fragment)(this.editor.state, this.editor.view.dispatch);
      this.focus();
    },
    async setContent(
      content,
      isAaddToHistory = content !== this.editor.exportMarkdown(),
      isToggleSource = true
    ) {
      if (this.isSource && !isToggleSource) {
        set(this.$refs.textarea, content);
        return;
      }

      if (this.isSource) {
        await this.toggleSource();
      }

      this.editor.setContent(
        content,
        false,
        isAaddToHistory
      );
    },
    setUnsavedContent(content) {
      this.unsavedContent = content;
    },
    clearContent() {
      this.editor.destroy();

      Object.keys(DEFAULT_DATA).forEach(key => (
        this[key] = DEFAULT_DATA[key]
      ));

      this.createEditor();
    },
    async createEditor() {
      this.isHugeContent = this.content.length > MAXIMUM_CONTENT_SIZE;

      const extensions = [this.fileUploaderExtension];
      if (this.shikiSearchExtension) {
        extensions.push(this.shikiSearchExtension);
      }

      this.editor = new VueEditor({
        content: this.isHugeContent ? '' : this.content,
        shikiRequest: this.shikiRequest,
        localizationField: this.localizationField,
        extensions,
        plugins: [
          preventHugePaste(MAXIMUM_CONTENT_SIZE),
          keymap({ 'Mod-Enter': this.submit })
        ]
      });

      watch(this.editor.reactiveState, this.updateNodesState);
      this.editorContent = this.content;

      if (this.isHugeContent) {
        this.toggleSource(this.content);
      }

      await this.$nextTick();

      this.fileUploaderExtension.attachShikiUploader({
        node: this.$refs.editor_container,
        progressContainerNode: this.$refs.menubar
      });
    },
    updateNodesState() {
      const memo = {};

      Object.keys(MENU_ITEMS).forEach(group => (
        MENU_ITEMS[group].forEach(item => (
          memo[item] = this.editor.activeChecks[item] ?
            this.editor.activeChecks[item]() :
            false
        ))
      ));

      this.isBoldBlock = this.editor.activeChecks.bold_block(); // eslint-disable-line
      memo.bold = this.isBoldBlock || this.editor.activeChecks.bold_inline();

      this.isColorBlock = this.editor.activeChecks.color_block(); // eslint-disable-line
      memo.color = this.isColorBlock || this.editor.activeChecks.color_inline();

      this.isItalicBlock = this.editor.activeChecks.italic_block(); // eslint-disable-line
      memo.italic = this.isItalicBlock || this.editor.activeChecks.italic_inline();

      this.isLinkBlock = this.editor.activeChecks.link_block(); // eslint-disable-line
      memo.link = this.isLinkBlock || this.editor.activeChecks.link_inline();

      memo.smiley = this.isSmiley;

      this.nodesState = memo;
    },
    async togglePreview() {
      this.isPreview = !this.isPreview;
      this.isPreviewLoading = this.isPreview;

      if (this.isPreview) {
        const text = this.isSource ?
          this.editorContent :
          this.editor.exportMarkdown();

        const { data } = await this.shikiRequest.post(
          'preview',
          this.previewParams ? { ...this.previewParams, text } : { text }
        );

        if (data !== null) {
          const { html, JS_EXPORTS } = data;

          this.previewHTML = html;
          this.isPreviewLoading = false;

          await this.$nextTick();
          this.$emit('preview', { node: this.$refs.preview, JS_EXPORTS });
        } else {
          this.isPreview = false;
          this.isPreviewLoading = false;
        }
      } else {
        this.previewHTML = null;

        await this.$nextTick();
        if (this.isSource) {
          autosize(this.$refs.textarea);
        }
      }
    },
    async toggleSource(overrideContent) {
      this.isPreview = false;
      const scrollY = scrollTop();

      this.isSource = !this.isSource;

      if (this.isSource) {
        this.editorContent = overrideContent || this.editor.exportMarkdown();
        this.editorPosition = this.editor.selection.from;
      } else {
        this.setContent(this.editorContent);
      }

      await this.$nextTick();

      if (this.isSource) {
        autosize(this.$refs.textarea);
        this.focus();
        window.scrollTo(0, scrollY);

        if (!withinviewport(this.$refs.menubar, 'top')) {
          this.$refs.textarea.blur();
          this.$refs.textarea.focus();
        }
      } else {
        this.focus(this.editorPosition);
        window.scrollTo(0, scrollY);
      }
    },
    toggleMobileMenuGroup(group, e) {
      this.activeMobileMenuGroup = this.activeMobileMenuGroup === group ?
        null :
        group;

      if (e) {
        e.preventDefault();
        e.currentTarget.blur();
        this.editor.focus();
      }
    },
    exportContent() {
      return this.isSource ? this.editorContent : this.editor.exportMarkdown();
    },
    async handleSourceKeypress(e) {
      if (e.keyCode === 27) { // esc
        preventEvent(e);
        this.toggleSource();
      }
      if (!e.metaKey && !e.ctrlKey) {
        return;
      }

      if ((e.keyCode === 10) || (e.keyCode === 13)) { // ctrl+enter
        preventEvent(e);
        this.toggleSource();
        await this.$nextTick();

        this.submit();
      }
      if (e.keyCode === 66) { // b - [b] tag
        preventEvent(e);
        sourceCommand(this, 'bold');
      }
      if (e.keyCode === 73) { // i - [i] tag
        preventEvent(e);
        sourceCommand(this, 'italic');
      }
      if (e.keyCode === 85) { // u - [u] tag
        preventEvent(e);
        sourceCommand(this, 'underline');
      }
      if (e.keyCode === 83) { //  - spoiler tag
        preventEvent(e);
        sourceCommand(this, 'spoiler_inline');
      }
      if (e.keyCode === 79) { // o - code tag
        preventEvent(e);
        sourceCommand(this, 'code_inline');
      }
    },
    submit() {
      this.$emit('submit');
    },
    async applyUnsavedContent() {
      this.setContent(this.unsavedContent, true, false);
      this.unsavedContent = null;
      await this.$nextTick();
      this.focus();
    },
    async discardUnsavedContent() {
      this.unsavedContent = null;
      await this.$nextTick();
      this.focus();
    },
    i18n_t(key) {
      return window.I18n.t(key);
    },
    toggleUnsavedConent() {
      this.isUnsavedContentExpanded = !this.isUnsavedContentExpanded;
      this.$refs.unsavedContentSpoiler.blur();
    }
  }
};

function preventEvent(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
}
</script>

<style lang='sass' src='../stylesheets/prosemirror.sass'/>
<style lang='sass' src='../stylesheets/prosemirror_shiki.sass'/>
<style scoped lang='sass' src='../stylesheets/app.sass'/>
