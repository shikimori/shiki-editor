<template>
  <div>
    <div ref='menubar' class='menubar'>
      <div v-if='editor' class='icons'>
        <div
          v-for='(items, index) in menuItems'
          :key='index'
          class='menu-group'
        >
          <Icon
            v-for='item in items'
            :key='item.constructor === Object ? item.type : item'
            :ref='item.type'
            v-bind='item'
            :is-active='isActive[item.type]'
            :is-enabled='item.isEnabled ? item.isEnabled() : isEnabled'
            @command='args => command(item.type, args)'
          />
        </div>
        <div class='menu-group source'>
          <Icon
            v-bind='menuSourceItem'
            :is-active='isSource'
            :is-enabled='isSourceEnabled'
            @command='() => toggleSourceCommand()'
          />
        </div>
      </div>
      <Smileys
        v-show='isSmiley'
        ref='smileys'
        :is-enabled='isSmiley'
        target-ref='smiley'
        :base-url='baseUrl'
        @toggle='smileyCommand'
      />
    </div>

    <div v-if='editor' ref='editor_container' class='editor-container'>
      <textarea
        v-if='isSource'
        ref='textarea'
        v-model='editorContent'
        class='ProseMirror'
      />
      <EditorContent v-else :editor='editor' />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import { undo, redo } from 'prosemirror-history';
import autosize from 'autosize';
import withinviewport from 'withinviewport';

import Editor from './editor';
import EditorContent from './components/editor_content';
import { scrollTop } from './utils';
import { FileUploader } from './extensions';

import Icon from './components/icon';
import Smileys from './components/smileys';

const MENU_ITEMS = [
  [
    'bold',
    'italic',
    'underline',
    'strike',
    'spoiler_inline',
    'code_inline',
    'link'
  ],
  ['undo', 'redo'],
  ['smiley', 'image', 'upload'],
  ['blockquote', 'spoiler_block', 'code_block', 'bullet_list']
];

export default {
  name: 'EditorApp',
  components: {
    EditorContent,
    Icon,
    Smileys
  },
  props: {
    baseUrl: { type: String, required: true },
    uploadEndpoint: { type: String, required: true },
    uploadHeaders: { type: Function, required: true },
    locale: { type: String, required: true },
    content: { type: String, required: true }
  },
  data: () => ({
    editor: null,
    editorContent: null,
    editorPosition: null,
    isSource: false,
    isLinkBlock: false,
    isSmiley: false,
    fileUploaderExtension: null
  }),
  computed: {
    isEnabled() {
      return !this.isSource;
    },
    isEnabledMappings() {
      return {
        undo: this.undoIsEnabled,
        redo: this.redoIsEnabled
      };
    },
    menuItems() {
      return MENU_ITEMS.map(items => items.map(item => ({
        type: item,
        title: I18n.t(`frontend.shiki_editor.${item}`),
        isEnabled: this.isEnabledMappings[item]
      })));
    },
    menuSourceItem() {
      return {
        type: 'source',
        title: I18n.t('frontend.shiki_editor.undo')
      };
    },
    isActive() {
      const memo = {};

      MENU_ITEMS.forEach(items => items.forEach(item => (
        memo[item] = this.editor.activeChecks[item] ?
          this.editor.activeChecks[item]() :
          false
      )));

      this.isLinkBlock = this.editor.activeChecks.link_block(); // eslint-disable-line
      memo.link = this.isLinkBlock || this.editor.activeChecks.link_inline();
      memo.smiley = this.isSmiley;

      return memo;
    },
    isSourceEnabled() {
      return !this.fileUploaderExtension.isUploading;
    }
  },
  watch: {
    isSource() {
      if (this.isSource) {
        this.fileUploaderExtension.disable();
      } else {
        this.fileUploaderExtension.enable();
      }
    }
  },
  mounted() {
    this.fileUploaderExtension = new FileUploader({
      progressContainerNode: this.$refs.menubar,
      locale: this.locale,
      uploadEndpoint: this.uploadEndpoint,
      uploadHeaders: this.uploadHeaders
    });

    this.editor = new Editor({
      extensions: [this.fileUploaderExtension],
      content: this.content,
      baseUrl: this.baseUrl
    }, this, Vue);
    this.editorContent = this.content;
  },
  beforeDestroy() {
    this.editor.destroy();
  },
  methods: {
    command(type, args) {
      const method = `${type}Command`;

      if (this[method] && this[method].constructor === Function) {
        this[method](args);
      } else if (type == 'link') {
        this.isLinkBlock ?
          this.editor.commands.link_block() :
          this.editor.commands.link_inline();
      } else {
        this.editor.commands[type]();
      }
    },
    undoCommand() {
      undo(this.editor.state, this.editor.view.dispatch);
      this.editor.focus();
    },
    redoCommand() {
      redo(this.editor.state, this.editor.view.dispatch);
      this.editor.focus();
    },
    smileyCommand(kind) {
      this.isSmiley = !this.isSmiley;

      if (kind) {
        this.editor.commands.smiley(kind);
      }
    },
    uploadCommand(files) {
      this.fileUploaderExtension.addFiles(files);
    },
    undoIsEnabled() {
      return this.isEnabled && undo(this.editor.state);
    },
    redoIsEnabled() {
      return this.isEnabled && redo(this.editor.state);
    },
    toggleSourceCommand() {
      const scrollY = scrollTop();

      if (this.isSource) {
        this.editor.setContent(this.editorContent);
      } else {
        this.editorContent = this.editor.exportMarkdown();
        this.editorPosition = this.editor.selection.from;
      }

      this.isSource = this.isEnabled;

      this.$nextTick().then(() => {
        if (this.isSource) {
          autosize(this.$refs.textarea);
          this.$refs.textarea.focus();
          window.scrollTo(0, scrollY);
          if (!withinviewport(this.$refs.menubar, 'top')) {
            this.$refs.textarea.blur();
            this.$refs.textarea.focus();
          }
        } else {
          this.editor.focus(this.editorPosition);
          window.scrollTo(0, scrollY);
        }
      });
    }
  }
};
</script>

<style lang='sass'>
@import ./stylesheets/prosemirror.sass
</style>

<style scoped lang='sass'>
.menubar
  background: #fff
  left: 0
  padding: 3px 0
  position: sticky
  right: 0
  top: 0
  z-index: 10

  .icons
    color: #456
    display: flex
    flex-wrap: wrap
    font-size: 16px
    min-height: 1em
    overflow: visible

  /deep/ .shiki-file_uploader-upload_progress
    margin-top: 1px
    margin-bottom: 3px

.menu-group
  display: flex
  flex-wrap: wrap
  padding: 5px 0

  & + .menu-group:before
    border-right: 1px solid #ddd
    content: ''
    margin: 0 5px 0 3px

  &.source
    margin-left: auto

    &:before
      display: none

textarea.ProseMirror
  min-height: 89px
  outline: none
  width: 100%

/deep/
  [data-image]:hover,
  [data-image].is-prosemirror-selected,
  [data-link]:hover,
  [data-div]:hover,
  [data-div].is-prosemirror-selected
    position: relative
    outline: 1px solid #8cf

    &:before
      background: #fcfcfc
      font-family: Monaco, Menlo, Consolas, Courier New, monospace;
      color: #2b8acc
      cursor: pointer
      display: inline
      font-size: 9px
      font-weight: normal
      left: 0
      letter-spacing: 0.8px
      line-height: 1
      padding: 2px
      pointer-events: none
      position: absolute
      text-shadow: 1px 1px 0px #fff
      top: 0
      z-index: 999

  [data-image]
    &.is-prosemirror-selected:before,
    &:hover:before
      content: attr(data-image)

  [data-link]
    &:hover:before
      content: attr(data-link)

  [data-div]
    &.is-prosemirror-selected:before,
    &:hover:before
      content: attr(data-div)
</style>
