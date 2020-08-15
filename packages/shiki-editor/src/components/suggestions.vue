<template>
  <div
    v-show='isSuggestions'
    ref='suggestions'
    class='b-tip b-tip--dark suggestions'
    :class='{
      "b-tip--is-loading": isLoading
    }'
  >
    <div data-popper-arrow />
    <div v-if='isLoading && !hasResults' class='item is-empty'>
      {{ t('frontend.lib.is_loading') }}
    </div>
    <template v-else-if='hasResults'>
      <div
        v-for='(user, index) in filteredUsers'
        :key='user.id'
        class='item'
        :class='{
          "is-selected": navigatedUserIndex === index,
          "is-loading": isLoading
        }'
        @click='selectUser(user)'
      >
        <img :src='user.avatar' class='avatar' />
        {{ user.nickname }}
      </div>
    </template>
    <div v-else class='item is-empty'>
      {{ t('frontend.lib.nothing_found') }}
    </div>
  </div>
</template>

<script>
// import Fuse from 'fuse.js';
// import delay from 'delay';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import offset from '@popperjs/core/lib/modifiers/offset';
import flip from '@popperjs/core/lib/modifiers/flip';
import arrow from '@popperjs/core/lib/modifiers/arrow';

import { RequestId } from 'shiki-utils';
import { buildSuggestionsPopupPlugin } from '../plugins';
import { insertUserMention } from '../commands';

export default {
  name: 'Suggestions',
  props: {
    editor: { type: Object, required: true },
    shikiRequest: { type: Object, required: true },
    isAvailable: { type: Boolean, required: true }
  },
  data: () => ({
    plugin: null,
    popup: null,
    popupNode: null,
    filteredUsers: [],
    insertMention: () => {},
    navigatedUserIndex: 0,
    query: null,
    suggestionRange: null,
    isLoading: true
  }),
  computed: {
    hasResults() {
      return this.filteredUsers.length;
    },
    isSuggestions() {
      return this.isAvailable &&
        (this.query || this.hasResults) &&
        this.popup;
    }
  },
  watch: {
    isAvailable() {
      if (!this.isAvailable && this.popup) {
        this.cleanup();
      }
    }
  },
  beforeDestroy() {
    this.cleanup();
    this?.editor?.unregisterPlugin(this.plugin.key);
  },
  mounted() {
    this.plugin = this.createPlugin();
    this.editor.registerPlugin(this.plugin);
  },
  methods: {
    createPlugin() {
      return buildSuggestionsPopupPlugin({
        showed: ({ query, range, command, virtualNode }) => {
          this.query = query;
          this.suggestionRange = range;
          this.renderPopup(virtualNode);
          this.insertMention = command;
          this.fetch();
        },
        updated: ({ query, range, virtualNode }) => {
          const priorQuery = query;
          this.query = query;
          this.suggestionRange = range;
          this.navigatedUserIndex = 0;
          this.renderPopup(virtualNode);
          this.fetch(priorQuery);
        },
        closed: (args) => {
          this.cleanup(args);
        },
        // is called on every keyDown event while a suggestion is active
        keyPresed: ({ event }) => {
          if (event.key === 'ArrowUp') {
            this.upHandler();
            return true;
          }
          if (event.key === 'ArrowDown') {
            this.downHandler();
            return true;
          }
          if (event.key === 'Enter' && this.hasResults) {
            this.enterHandler();
            return true;
          }
          if (event.key === 'Escape') {
            this.escHandler();
            return true;
          }
          return false;
        },
        command: ({ range, attrs, schema }) => (
          insertUserMention({
            range,
            attrs: {
              id: attrs.id,
              text: attrs.nickname,
              url: attrs.url
            },
            schema,
            editor: this.editor
          })
        )
      });
    },
    // navigate to the previous item
    // if it's the first item, navigate to the last one
    upHandler() {
      this.navigatedUserIndex = (
        (this.navigatedUserIndex + this.filteredUsers.length) - 1
      ) % this.filteredUsers.length;
    },
    // navigate to the next item
    // if it's the last item, navigate to the first one
    downHandler() {
      this.navigatedUserIndex = (this.navigatedUserIndex + 1) % this.filteredUsers.length;
    },
    enterHandler() {
      const user = this.filteredUsers[this.navigatedUserIndex];
      if (user) {
        this.selectUser(user);
      }
    },
    escHandler() {
      this.closePopup();
    },
    selectUser(user) {
      this.insertMention({
        range: this.suggestionRange,
        attrs: user
      });
      this.editor.focus();
    },
    renderPopup(node) {
      if (this.isMisplaced(node)) {
        this.cleanup();
        return;
      }

      if (this.popup) { return; }

      this.popupNode = node;
      this.popup = createPopper(
        { getBoundingClientRect: node.getBoundingClientRect },
        this.$refs.suggestions,
        {
          placement: 'bottom-start',
          modifiers: [preventOverflow, offset, flip, arrow, {
            name: 'preventOverflow',
            options: { padding: 10 }
          }, {
            name: 'offset',
            options: { offset: [-8, 8] }
          }]
        }
      );
    },
    isMisplaced(node) {
      return JSON.stringify(node.getBoundingClientRect()) ===
        JSON.stringify(new DOMRect());
    },
    async fetch(priorQuery) {
      if (priorQuery && this.query.includes(priorQuery) &&
        !this.filteredUsers.length
      ) {
        return;
      }
      const requestId = new RequestId('autocomplete_users');
      this.isLoading = true;

      const { data } = await this.shikiRequest.autocomplete('user', this.query);

      if (requestId.isCurrent) {
        this.filteredUsers = data;
        this.isLoading = false;
        await this.$nextTick();
        this.popup?.update();
      }
    },
    cleanup() {
      this.query = null;
      this.filteredUsers = [];
      this.suggestionRange = null;
      this.navigatedUserIndex = 0;

      this.closePopup();
    },
    closePopup() {
      if (!this.popup) { return; }

      this.popup.destroy();
      this.popup = null;
    },
    t(key) {
      return I18n.t(key);
    }
  }
};
</script>

<style scoped lang='sass'>
.b-tip
  min-width: 120px

.suggestions
  z-index: 35
  /* padding: 0.2rem */
  /* border: 2px solid rgba(#000, 0.1) */

  .item
    padding: 3px 16px 3px 12px
    margin: 0 -8px 3px
    position: relative // to prevent overlap by arrow
    display: flex
    align-items: center

    .avatar
      width: 20px
      height: 20px
      margin-right: 10px


    &:last-child
      margin-bottom: 0

    &:not(.is-empty):not(.is-loading),
      cursor: pointer

      &.is-selected,
      &:hover
        background-color: rgba(#fff, 0.2)

    &.is-empty
      opacity: 0.7
</style>
