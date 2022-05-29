<template>
  <label
    v-if='isUpload'
    ref='icon'
    :tabindex='isEnabled ? undefined : -1'
    class='icon'
    :title='title'
    :class='{
      [`icon-${type}`]: true,
      "is-active": isEnabled && isActive,
      "is-disabled": isDisabled || !isEnabled
    }'
  >
    <input type='file' multiple @change='upload'>
  </label>
  <button
    v-else
    ref='icon'
    :tabindex='isEnabled ? undefined : -1'
    :title='title'
    class='icon'
    :class='{
      [`icon-${type}`]: true,
      "is-button": isButton,
      "is-active": isEnabled && isActive,
      "is-disabled": isDisabled || !isEnabled
    }'
    :disabled="isDisabled || !isEnabled"
    @click='execute'
  >
    <span v-if='isButton'>{{ title }}</span>
  </button>
</template>

<script>
export default {
  name: 'Icon',
  inheritAttrs: false,
  props: {
    type: { type: String, required: true },
    title: { type: String, required: true },
    isActive: { type: Boolean, required: false, default: false },
    isEnabled: { type: Boolean, required: false, default: true },
    isDisabled: { type: Boolean, required: false, default: false },
    isButton: { type: Boolean, required: false, default: false }
  },
  computed: {
    isUpload() {
      return this.type === 'upload';
    }
  },
  methods: {
    execute(e) {
      e.preventDefault();
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
@import ../../stylesheets/mixins/icon

.icon
  +icon

  $icons: ("bold": "\e802", "italic": "\e804", "underline": "\e807", "strike": "\e805", "link": "\1f517", "spoiler_inline": "\f31a", "code_inline": "\ef53", "undo": "\ebb0", "redo": "\ebaf", "image": "\E808", "smiley": "\e800", "shiki_link": "\e80d", "upload": "\e80c", "bullet_list": "\ebab", "blockquote": "\e80b", "code_block": "\ebac", "spoiler_block": "\f31b", "preview": "\e806", "source": "\e809", "color": "\f020", "headline": "\f1dc", "fontsize": "\e800")
  @each $name, $glyph in $icons
    &-#{$name}:before
      content: $glyph

input
  display: none
</style>
