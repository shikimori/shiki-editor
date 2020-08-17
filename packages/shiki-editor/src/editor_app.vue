<template>
  <div>
    <div
      ref='menubar'
      class='menubar'
      :class='{ "is-offset": isMenuBarOffset }'
    >
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
            :is-active='nodesState[item.type]'
            :is-enabled='item.isEditingEnabled ? item.isEditingEnabled() : isEditingEnabled'
            @command='args => command(item.type, args)'
          />
        </div>
        <div class='menu-group offset'>
          <div
            v-if='isPreviewLoading'
            class='icon-loader b-ajax vk-like'
          />
          <Icon
            v-bind='menuPreviewItem'
            :is-active='isPreview'
            :is-enabled='isPreviewEnabled'
            @command='() => togglePreview()'
          />
          <Icon
            v-bind='menuSourceItem'
            :is-active='isSource'
            :is-enabled='isSourceEnabled'
            @command='() => toggleSource()'
          />
        </div>
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
      />
      <EditorContent
        v-else
        :editor='editor'
      />
    </div>

    <Smileys
      v-show='isSmiley && isEditingEnabled'
      ref='smileys'
      :is-enabled='isSmiley'
      target-ref='smiley'
      :origin='shikiRequest.origin'
      @toggle='smileyCommand'
    />
    <Suggestions
      :is-available='isEditingEnabled'
      :editor='editor'
      :shiki-request='shikiRequest'
    />
  </div>
</template>

<script>
import autosize from 'autosize';
import withinviewport from 'withinviewport';

import { undo, redo } from 'prosemirror-history';

import ShikiEditor from './editor';
import EditorContent from './components/editor_content';
import { scrollTop } from './utils';
import { FileUploader } from './extensions';

import { flash } from 'shiki-utils';

import Icon from './components/icon';
import Smileys from './components/smileys';
import Suggestions from './components/suggestions';

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
const MAXIMUM_CONTENT_SIZE = 100000;

export default {
  name: 'EditorApp',
  components: {
    EditorContent,
    Icon,
    Smileys,
    Suggestions
  },
  props: {
    vue: { type: Function, required: true },
    shikiRequest: { type: Object, required: true },
    content: { type: String, required: true },
    shikiUploader: { type: Object, required: true }
  },
  data: () => ({
    editor: null,
    editorContent: null,
    editorPosition: null,
    isSource: false,
    isItalicBlock: false,
    isBoldBlock: false,
    isLinkBlock: false,
    isSmiley: false,
    fileUploaderExtension: null,
    isMenuBarOffset: false,
    isPreview: false,
    isPreviewLoading: false,
    previewHTML: null,
    isHugeContent: false
  }),
  computed: {
    isEditingEnabled() {
      return !this.isSource && !this.isPreview;
    },
    isEditingEnabledMappings() {
      return {
        undo: this.undoIsEnabled,
        redo: this.redoIsEnabled,
        link: this.linkIsEnabled
      };
    },
    menuItems() {
      return MENU_ITEMS.map(items => items.map(item => ({
        type: item,
        title: window.I18n.t(`frontend.shiki_editor.${item}`),
        isEditingEnabled: this.isEditingEnabledMappings[item]
      })));
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
    nodesState() {
      const memo = {};

      MENU_ITEMS.forEach(items => items.forEach(item => (
        memo[item] = this.editor.activeChecks[item] ?
          this.editor.activeChecks[item]() :
          false
      )));

      this.isBoldBlock = this.editor.activeChecks.bold_block(); // eslint-disable-line
      memo.bold = this.isBoldBlock || this.editor.activeChecks.bold_inline();

      this.isItalicBlock = this.editor.activeChecks.italic_block(); // eslint-disable-line
      memo.italic = this.isItalicBlock || this.editor.activeChecks.italic_inline();

      this.isLinkBlock = this.editor.activeChecks.link_block(); // eslint-disable-line
      memo.link = this.isLinkBlock || this.editor.activeChecks.link_inline();

      memo.smiley = this.isSmiley;

      return memo;
    },
    isContentManipulationsPending() {
      return this.fileUploaderExtension.isUploading;
    },
    isPreviewEnabled() {
      return !this.isContentManipulationsPending;
    },
    isSourceEnabled() {
      return !this.isHugeContent &&
        !this.isContentManipulationsPending && !this.isPreview;
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
  async created() {
    this.isHugeContent = this.content.length > MAXIMUM_CONTENT_SIZE;
    this.fileUploaderExtension = new FileUploader({
      shikiUploader: this.shikiUploader
    });

    this.editor = new ShikiEditor({
      content: this.isHugeContent ? '' : this.content,
      shikiRequest: this.shikiRequest,
      extensions: [this.fileUploaderExtension],
      plugins: []
    }, this, this.vue);

    this.editorContent = this.content;

    if (this.isHugeContent) {
      this.toggleSource(this.content);
      await this.$nextTick();
      flash.info(window.I18n.t('frontend.shiki_editor.too_large_content'));
    }
  },
  mounted() {
    this.fileUploaderExtension.attachShikiUploader({
      node: this.$refs.editor_container,
      progressContainerNode: this.$refs.menubar
    });
  },
  beforeDestroy() {
    this.editor.destroy();
  },
  methods: {
    command(type, args) {
      const method = `${type}Command`;

      if (this[method] && this[method].constructor === Function) {
        return this[method](args);
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
      return this.isEditingEnabled && undo(this.editor.state);
    },
    redoIsEnabled() {
      return this.isEditingEnabled && redo(this.editor.state);
    },
    linkIsEnabled() {
      return this.isEditingEnabled && (
        this.nodesState.link || !this.editor.state.selection.empty
      );
    },
    async togglePreview() {
      this.isPreview = !this.isPreview;
      this.isPreviewLoading = this.isPreview;

      if (this.isPreview) {
        const text = this.isSource ?
          this.editorContent :
          this.editor.exportMarkdown();

        const { data } = await this.shikiRequest.post('preview', { text });

        if (data !== null) {
          this.previewHTML = data;
          this.isPreviewLoading = false;

          await this.$nextTick();
          this.$emit('preview', this.$refs.preview);
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

      if (this.isSource) {
        this.editor.setContent(this.editorContent);
      } else {
        this.editorContent = overrideContent || this.editor.exportMarkdown();
        this.editorPosition = this.editor.selection.from;
      }

      this.isSource = !this.isSource;

      await this.$nextTick();

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
    }
  }
};
</script>

<style lang='sass'>
@import ./stylesheets/prosemirror.sass
@import ./stylesheets/prosemirror_shiki.sass
</style>

<style scoped lang='sass'>
.menubar
  background: #fff
  left: 0
  padding: 3px 0
  position: sticky
  right: 0
  top: 0
  z-index: 30

  &.is-offset
    top: 45px

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

  &.offset
    margin-left: auto

    &:before
      display: none

  .icon-loader
    width: 55px

.editor-container
  &.is-loading
    position: relative

    &:before
      background: rgba(255, 255, 255, 0.75)
      content: ''
      height: 100%
      left: 0
      position: absolute
      top: 0
      width: 100%
      z-index: 3

  &.is-source
    line-height: 0

  .preview
    padding: 5px 8px 5px

/deep/ .ProseMirror
  span[contenteditable=false]
    cursor: default

  [data-image]:hover,
  [data-link]:hover,
  [data-div]:hover
    outline: 1px solid #9cf
    position: relative

  [data-image]:hover,
  [data-link]:hover,
  [data-div]:hover,
  [data-image].is-prosemirror-selected,
  [data-div].is-prosemirror-selected
    &:before
      background: #fcfcfc
      color: #2b8acc
      cursor: pointer
      font-family: var(--font-code, Monaco, Menlo, Consolas, Courier New, monospace)
      font-size: 9px
      font-weight: normal
      left: 0
      letter-spacing: 0.8px
      line-height: 1.25
      padding: 2px
      pointer-events: none
      position: absolute
      text-shadow: 1px 1px 0px #fff
      top: 0
      z-index: 20

  [data-image].is-prosemirror-selected,
  [data-div].is-prosemirror-selected
    outline: 2px solid #9cf
    position: relative

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
