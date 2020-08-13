<template>
  <div
    v-show='showSuggestions'
    ref='suggestions'
    class='suggestion-list'
  >
    <template v-if='hasResults'>
      <div
        v-for='(user, index) in filteredUsers'
        :key='user.id'
        class='suggestion-list__item'
        :class='{ "is-selected": navigatedUserIndex === index }'
        @click='selectUser(user)'
      >
        {{ user.name }}
      </div>
    </template>
    <div v-else class='suggestion-list__item is-empty'>
      No users found
    </div>
  </div>
</template>

<script>
export default {
  name: 'Suggestions',
  props: {
    insertMention: { type: Function, required: true },
    editor: { type: Object, required: true },
    filteredUsers: { type: Array, required: true },
    query: { type: String, required: false, default: undefined }
  },
  computed: {
    hasResults() {
      return this.filteredUsers.length;
    },
    showSuggestions() {
      return this.query || this.hasResults;
    }
  },
  methods: {
    // we have to replace our suggestion text with a mention
    // so it's important to pass also the position of your suggestion text
    selectUser(user) {
      this.insertMention({
        range: this.suggestionRange,
        attrs: {
          id: user.id,
          label: user.name
        }
      });
      this.editor.focus();
    }
  }
};
</script>

<style scoped lang='sass'>
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
</style>
