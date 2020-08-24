<template>
  <label
    v-if='isUpload'
    ref='icon'
    :tabindex='isEnabled ? undefined : -1'
    class='icon'
    :title='title'
    :class='{
      [type]: true,
      "is-active": isEnabled && isActive,
      "is-disabled": !isEnabled
    }'
  >
    <input type='file' multiple @change='upload'>
  </label>
  <button
    v-else
    ref='icon'
    class='icon'
    :tabindex='isEnabled ? undefined : -1'
    :title='title'
    :class='{
      [type]: true,
      "is-active": isEnabled && isActive,
      "is-disabled": !isEnabled
    }'
    @click='execute'
  />
</template>

<script>
export default {
  name: 'Icon',
  props: {
    type: { type: String, required: true },
    title: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    isEnabled: { type: Boolean, required: false, default: true }
  },
  computed: {
    isUpload() {
      return this.type === 'upload';
    }
  },
  methods: {
    execute() {
      if (!this.isEnabled) { return; }
      this.$refs.icon.blur();
      this.$emit('command');
    },
    upload({ currentTarget }) {
      this.$refs.icon.blur();
      this.$emit('command', currentTarget.files);
    }
  }
};
</script>

<style scoped lang='sass'>
@import ../stylesheets/responsive

.icon
  -webkit-appearance: none
  background: transparent
  border-radius: 4px
  border: none

  +lte_ipad
    font-size: 16px
    height: 23px
    margin: 0 1px
    padding: 0 4px
    width: 32px

  +gte_laptop
    font-size: 15px
    height: 20px
    margin: 0 2px
    padding: 0 4px
    width: 28px

  &:active
    outline: none

  &:not(.is-disabled)
    color: #456
    cursor: pointer

    @media screen and (min-width: 1024px)
      &:hover
        color: var(--link-hover-color, #dd5202)

    &:active
      color: var(--link-active-color, #ff0202)

  &.is-disabled
    color: rgba(#123, 0.3)
    outline: none
    pointer-events: none

  &.is-active
    background: rgba(#acb1b4, 0.25)

  &:before
    // it is a copy of shikimori font mixin
    font-family: shiki-editor
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
    font-feature-settings: 'liga'
    text-transform: none
    letter-spacing: normal

  $icons: ("bold": "\e802", "italic": "\e804", "underline": "\e807", "strike": "\e805", "link": "\1f517", "spoiler_inline": "\f31a", "code_inline": "\ef53", "undo": "\ebb0", "redo": "\ebaf", "image": "\E808", "smiley": "\e800", "shiki_link": "\e80d", "upload": "\e80c", "bullet_list": "\ebab", "blockquote": "\e80b", "code_block": "\ebac", "spoiler_block": "\f31b")
  @each $name, $glyph in $icons
    &.#{$name}:before
      content: $glyph

  &.preview,
  &.source
    width: auto

    &:before
      display: block
      font-family: Courier New
      font-weight: bold
      margin-top: -1px

  &.preview:before
    body[data-locale=ru] &
      content: '<предпросмотр>'

    body[data-locale=en] &
      content: '<preview>'

  &.source:before
    body[data-locale=ru] &
      content: '<ббкоды>'

    body[data-locale=en] &
      content: '<bbcode>'

input
  display: none
</style>
