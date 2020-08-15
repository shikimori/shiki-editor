<template>
  <div
    v-show='isSuggestions'
    ref='suggestions'
    class='b-tip b-tip--dark suggestions'
  >
    <div data-popper-arrow />
    <template v-if='hasResults'>
      <div
        v-for='(user, index) in filteredUsers'
        :key='user.id'
        class='item'
        :class='{ "is-selected": navigatedUserIndex === index }'
        @click='selectUser(user)'
      >
        {{ user.nickname }}
      </div>
    </template>
    <div v-else class='item is-empty'>
      No users found
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
    isLoading: false
  }),
  computed: {
    hasResults() {
      return this.filteredUsers.length;
    },
    isSuggestions() {
      return this.isAvailable && (this.query || this.hasResults);
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
          console.log('showed');
          this.query = query;
          this.suggestionRange = range;
          this.renderPopup(virtualNode);
          this.insertMention = command;
          this.fetch();
        },
        updated: ({ query, range, virtualNode }) => {
          console.log('updated');
          this.query = query;
          this.suggestionRange = range;
          this.navigatedUserIndex = 0;
          this.renderPopup(virtualNode);
          this.fetch();
        },
        closed: (args) => {
          console.log('closed');
          this.cleanup(args);
        },
        // is called on every keyDown event while a suggestion is active
        keyPresed: ({ event }) => {
          // console.log('keyPresed');
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
          return false;
        },
        command: ({ range, attrs, schema }) => (
          insertUserMention({ range, attrs, schema, editor: this.editor })
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
          placement: 'top-start',
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
    async fetch() {
      const requestId = new RequestId('autocomplete_users');
      this.isLoading = true;

      const { data } = await this.shikiRequest.autocomplete('user', this.query);

      if (requestId.isCurrent) {
        this.filteredUsers = data;
        this.isLoading = false;
        await this.$nextTick();
        this.popup.update();
      }
    },
    cleanup() {
      this.query = null;
      this.filteredUsers = [];
      this.suggestionRange = null;
      this.navigatedUserIndex = 0;

      if (this.popup) {
        this.popup.destroy();
        this.popup = null;
      }
    }
  }
};
</script>

<style scoped lang='sass'>
.suggestions
  z-index: 35
  /* padding: 0.2rem */
  /* border: 2px solid rgba(#000, 0.1) */

  .item
    padding: 3px 16px
    margin: 0 -8px 3px
    cursor: pointer
    position: relative // to prevent overlap by arrow

    &:last-child
      margin-bottom: 0

    &.is-selected,
    &:hover
      background-color: rgba(#fff, 0.2)

    &.is-empty
      opacity: 0.5
</style>
