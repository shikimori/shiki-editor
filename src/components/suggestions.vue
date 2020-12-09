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
      {{ t('frontend.lib.loading') }}
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
        <img :src='user.avatar' class='avatar' :title='user.nickname'>
        {{ user.nickname }}
      </div>
    </template>
    <div v-else class='item is-empty'>
      {{ t('frontend.lib.nothing_found') }}
    </div>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core/lib/popper-lite';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import offset from '@popperjs/core/lib/modifiers/offset';
import flip from '@popperjs/core/lib/modifiers/flip';
import arrow from '@popperjs/core/lib/modifiers/arrow';

import { RequestId } from 'shiki-utils';
import { buildSuggestionsPopupPlugin } from '../plugins';
import { insertUserMention } from '../commands';

const QUERY_MATCHERS = {
  equals: (query) => {
    const lowerQuery = query.toLowerCase();
    return v => v.nickname.toLowerCase() === lowerQuery;
  },
  startsWith: (query) => {
    const lowerQuery = query.toLowerCase();
    return v => v.nickname.toLowerCase().startsWith(lowerQuery);
  }
};

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
    isLoading: true,
    wasLoadedSomething: false,
    isUserSelected: false,
    requestId: null
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
        matcher: {
          char: '@',
          allowSpaces: true,
          startOfLine: false
        },
        showed: ({ query, range, command, virtualNode }) => {
          this.query = query;
          this.suggestionRange = range;
          this.renderPopup(virtualNode);
          this.insertMention = command;
          this.wasLoadedSomething = false;
          this.fetch();
        },
        updated: ({ query, range, virtualNode }) => {
          // const priorQuery = this.query;
          // const priorFilteredUsers = this.filteredUsers;

          this.query = query;
          this.suggestionRange = range;
          this.navigatedUserIndex = 0;
          this.renderPopup(virtualNode);

          this.fetch(query);
        },
        closedEmpty: (args) => {
          this.cleanup(args);
        },
        closed: (args) => {
          const { query } = this;

          if (!this.isUserSelected && this.hasResults && query.length > 1) {
            if (query[query.length - 1] === ' ') {
              this.trySelectUser(query.slice(0, query.length - 1), 1);
            } else {
              this.trySelectUser(query);
            }
          }

          this.cleanup(args);
        },
        // is called on every keyDown event while a suggestion is active
        keyPresed: ({ event }) => {
          if (event.key === 'Escape') {
            this.escHandler();
            return true;
          }
          if (!this.popup) { return false; }

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
          if (event.key === ',' && this.hasResults) {
            this.trySelectUser(this.query);
            return false;
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
            schema
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
      this.isUserSelected = true;
      this.insertMention({
        range: tryShortenRange(this.suggestionRange, user.nickname, this.query),
        attrs: user
      });
      this.editor.focus();
    },
    trySelectUser(query, decrementSuggestionRange = 0) {
      const user = this.matchUser(query, 'equals');

      if (user) {
        if (decrementSuggestionRange) {
          this.suggestionRange.to -= decrementSuggestionRange;
        }
        this.selectUser(user);
      }
    },
    matchUser(query, matcher, users = this.filteredUsers) {
      return users.find(QUERY_MATCHERS[matcher](query));
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
    async fetch(query) {
      if (query && this.query.includes(query) &&
        !this.filteredUsers.length && this.wasLoadedSomething
      ) {
        this.shikiRequest.autocompleteNull('user', this.query);
        return;
      }
      const requestId = new RequestId('autocomplete_users');
      this.isLoading = true;

      const { data } = await this.shikiRequest.autocomplete('user', this.query);
      this.wasLoadedSomething ||= !!data.length;

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

      this.isLoading = true;
      this.navigatedUserIndex = 0;
      this.wasLoadedSomething = false;
      this.isUserSelected = false;

      this.closePopup();
    },
    closePopup() {
      if (!this.popup) { return; }

      this.popup.destroy();
      this.popup = null;
    },
    t(key) {
      return window.I18n.t(key);
    }
  }
};

// When query contains nickname, cut everythign except nickname:
//    nickname: "World_Houp"
//    query: "World_Houp - "
//    result: decrement `range.to` on `query.length - nickname.length`
// When query ends with [^\w+], cut extra content
//    nickname: "WORLD"
//    query: "World_Houp - "
//    result: decrement `range.to` on `' - '.length`
const TRAILING_CONTENT_REGEXP = /[^\w]+$/;
function tryShortenRange(range, nickname, query) {
  if (query.length > nickname.length) {
    if (query.startsWith(nickname)) {
      return {
        from: range.from,
        to: range.to - (query.length - nickname.length)
      };
    }

    const trailingContentMatch = query.match(TRAILING_CONTENT_REGEXP);
    if (trailingContentMatch) {
      return {
        from: range.from,
        to: range.to - trailingContentMatch[0].length
      };
    }
  }
  return range;
}
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
