<template>
  <PopupContent
    :is-sticky-menu-offset='isStickyMenuOffset'
    :target-ref='targetRef'
    @close='cancel'
  >
    <component
      :is='headline.tag'
      v-for='headline in headlinesHTML'
      :key='headline.value'
      class='item'
      :class='headline.name'
      @click='select(headline.value)'
      v-html='headline.html'
    />
  </PopupContent>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import PopupContent from './popup_content';

defineProps({
  targetRef: { type: Object, required: false, default: undefined },
  isStickyMenuOffset: { type: Boolean, required: true }
});
const emit = defineEmits(['toggle']);

const DEFAULT_HEADLINES = [
  { value: 1, name: 'header_1', tag: 'h2' },
  { value: 2, name: 'header_2', tag: 'h3' },
  { value: 3, name: 'header_3', tag: 'h4' },
  { value: 4, name: 'headline', tag: 'div' },
  { value: 5, name: 'midheadline', tag: 'div' }
];
const headlinesHTML = DEFAULT_HEADLINES.map(headline => ({
  ...headline,
  html: window.I18n.t(`frontend.shiki_editor.headlines.${headline.name}`)
    .replace(/#+/, '<span>$&</span>')
}));

function cancel() {
  emit('toggle', { isClosed: true });
}

function select(size) {
  emit('toggle', { size });
}
</script>

<style scoped lang='sass'>
@import ../../stylesheets/globals
@import ../../stylesheets/mixins/responsive

.item
  cursor: pointer
  outline: 2px solid transparent
  transition: outline .15s

  &:not(:last-child)
    margin: 0 0 10px 0

  &:last-child
    margin: 0

  +gte_laptop
    &:hover
      outline: 2px solid var(--link-hover-color, #dd5202)

  &:active
    outline: 2px solid var(--link-active-color, #ff0202)

  ::v-deep(span)
    color: $gray-1
</style>
