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
        {{ user.name }}
      </div>
    </template>
    <div v-else class='item is-empty'>
      No users found
    </div>
  </div>
</template>

<script>
import Fuse from 'fuse.js';
import delay from 'delay';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import offset from '@popperjs/core/lib/modifiers/offset';
import flip from '@popperjs/core/lib/modifiers/flip';
import arrow from '@popperjs/core/lib/modifiers/arrow';

import { buildSuggestionsPlugin } from '../plugins';

export default {
  name: 'Suggestions',
  props: {
    editor: { type: Object, required: true },
    isAvailable: { type: Boolean, required: true }
  },
  data: () => ({
    plugin: null,
    popup: null,
    filteredUsers: [],
    insertMention: () => {},
    navigatedUserIndex: 0,
    query: null,
    suggestionRange: null
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
      return buildSuggestionsPlugin({
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
        onExit: this.cleanup,
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
        attrs: {
          id: user.id,
          label: user.name
        }
      });
      this.editor.focus();
    },
    renderPopup(node) {
      if (this.popup) { return; }

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
