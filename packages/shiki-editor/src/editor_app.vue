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
            :is-active='isActive[item.type]'
            :is-enabled='item.isEnabled ? item.isEnabled() : isEnabled'
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
      <Smileys
        v-show='isSmiley'
        ref='smileys'
        :is-enabled='isSmiley'
        target-ref='smiley'
        :base-url='baseUrl'
        @toggle='smileyCommand'
      />
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
        v-if='isPreview && previewHTML'
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
  </div>
</template>

<script>
import Fuse from 'fuse.js';
import autosize from 'autosize';
import tippy, { sticky } from 'tippy.js';
import withinviewport from 'withinviewport';
import delay from 'delay';

import { undo, redo } from 'prosemirror-history';

import ShikiEditor from './editor';
import EditorContent from './components/editor_content';
import { scrollTop } from './utils';
import { FileUploader } from './extensions';
import { buildSuggestions } from './plugins';

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
    vue: { type: Function, required: true },
    baseUrl: { type: String, required: true },
    preview: { type: Function, required: true },
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


    query: null,
    suggestionRange: null,
    filteredUsers: [],
    navigatedUserIndex: 0,
    insertMention: () => {}
  }),
  computed: {
    isEnabled() {
      return !this.isSource && !this.isPreview;
    },
    isEnabledMappings() {
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
        isEnabled: this.isEnabledMappings[item]
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
    isActive() {
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
      return !this.isContentManipulationsPending && !this.isPreview;
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
  created() {
    this.fileUploaderExtension = new FileUploader({
      shikiUploader: this.shikiUploader
    });

    this.editor = new ShikiEditor({
      content: this.content,
      baseUrl: this.baseUrl,
      extensions: [this.fileUploaderExtension],
      plugins: [
        buildSuggestions({
          // a list of all suggested items
          items: async() => {
            await new Promise(resolve => {
              setTimeout(resolve, 500);
            });
            return [
              { id: 1, name: 'Sven Adlung' },
              { id: 2, name: 'Patrick Baber' },
              { id: 3, name: 'Nick Hirche' },
              { id: 4, name: 'Philip Isik' },
              { id: 5, name: 'Timo Isik' },
              { id: 6, name: 'Philipp Kühn' },
              { id: 7, name: 'Hans Pagel' },
              { id: 8, name: 'Sebastian Schrama' }
            ];
          },
          // is called when a suggestion starts
          onEnter: ({
            items, query, range, command, virtualNode
          }) => {
            this.query = query;
            this.filteredUsers = items;
            this.suggestionRange = range;
            this.renderPopup(virtualNode);
            // we save the command for inserting a selected mention
            // this allows us to call it inside of our custom popup
            // via keyboard navigation and on click
            this.insertMention = command;
          },
          // is called when a suggestion has changed
          onChange: ({
            items, query, range, virtualNode
          }) => {
            this.query = query;
            this.filteredUsers = items;
            this.suggestionRange = range;
            this.navigatedUserIndex = 0;
            this.renderPopup(virtualNode);
          },
          // is called when a suggestion is cancelled
          onExit: () => {
            // reset all saved values
            this.query = null;
            this.filteredUsers = [];
            this.suggestionRange = null;
            this.navigatedUserIndex = 0;
            this.destroyPopup();
          },
          // is called on every keyDown event while a suggestion is active
          onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
              this.upHandler();
              return true;
            }
            if (event.key === 'ArrowDown') {
              this.downHandler();
              return true;
            }
            if (event.key === 'Enter') {
              this.enterHandler();
              return true;
            }
            return false;
          },
          // is called when a suggestion has changed
          // this function is optional because there is basic filtering built-in
          // you can overwrite it if you prefer your own filtering
          // in this example we use fuse.js with support for fuzzy search
          onFilter: async(items, query) => {
            if (!query) {
              return items;
            }
            await delay(500);
            const fuse = new Fuse(items, {
              threshold: 0.2,
              keys: ['name']
            });
            return fuse.search(query).map(item => item.item);
          }
        })
      ]
    }, this, this.vue);

    this.editorContent = this.content;
  },
  mounted() {
    this.fileUploaderExtension.attachShikiUploader({
      node: this.$refs.editor_container,
      progressContainerNode: this.$refs.menubar
    });
  },
  beforeDestroy() {
    this.editor.destroy();
    this.destroyPopup();
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
    linkIsEnabled() {
      return this.isEnabled && (
        this.isActive.link || !this.editor.state.selection.empty
      );
    },
    async togglePreview() {
      this.isPreview = !this.isPreview;
      this.isPreviewLoading = this.isPreview;

      if (this.isPreview) {
        const { data } = await this.preview(
          this.isSource ? this.editorContent : this.editor.exportMarkdown()
        );
        this.previewHTML = data;
        this.isPreviewLoading = false;

        await this.$nextTick();
        this.$emit('preview', this.$refs.preview);
      } else {
        this.previewHTML = null;
      }
    },
    async toggleSource() {
      this.isPreview = false;
      const scrollY = scrollTop();

      if (this.isSource) {
        this.editor.setContent(this.editorContent);
      } else {
        this.editorContent = this.editor.exportMarkdown();
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
    },
    // renders a popup with suggestions
    // tiptap provides a virtualNode object for using popper.js (or tippy.js) for popups
    renderPopup(node) {
      if (this.popup) { return; }
      // ref: https://atomiks.github.io/tippyjs/v6/all-props/
      this.popup = tippy('.page', {
        getReferenceClientRect: node.getBoundingClientRect,
        appendTo: () => document.body,
        interactive: true,
        sticky: true, // make sure position of tippy is updated when content changes
        plugins: [sticky],
        content: this.$refs.suggestions,
        trigger: 'mouseenter', // manual
        showOnCreate: true,
        theme: 'dark',
        placement: 'top-start',
        inertia: true,
        duration: [400, 200]
      });
    },
    destroyPopup() {
      if (!this.popup) { return; }

      this.popup[0].destroy();
      this.popup = null;
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

/deep/
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


.mention
  background: rgba(#000, 0.1)
  color: rgba(#000, 0.6)
  font-size: 0.8rem
  font-weight: bold
  border-radius: 5px
  padding: 0.2rem 0.5rem
  white-space: nowrap

.mention-suggestion
  color: rgba(#000, 0.6)

.suggestion-list
  padding: 0.2rem
  border: 2px solid rgba(#000, 0.1)
  font-size: 0.8rem
  font-weight: bold
  &__no-results
    padding: 0.2rem 0.5rem

  &__item
    border-radius: 5px
    padding: 0.2rem 0.5rem
    margin-bottom: 0.2rem
    cursor: pointer

    &:last-child
      margin-bottom: 0

    &.is-selected,
    &:hover
      background-color: rgba(#fff, 0.2)

    &.is-empty
      opacity: 0.5

.tippy-box[data-theme~=dark]
  background-color: #000
  padding: 0
  font-size: 1rem
  text-align: inherit
  color: #fff
  border-radius: 5px
</style>
