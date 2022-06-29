<template>
  <PopupContent
    :is-sticky-menu-offset='isStickyMenuOffset'
    :target-ref='targetRef'
    @close='cancel'
  >
    <div @click='select'>
      <div
        v-for='headline in headersHTML'
        :key='headline.value'
        :title='headline.title'
        :data-value='headline.value'
        :style='{ fontSize: `${18-headline.value * 1.2}px` }'
        class='header clickable-item'
      >
        {{ headline.title }}
      </div>
      <br>
      <div
        v-for='headline in headlinesHTML'
        :key='headline.value'
        :title='headline.title'
        :data-value='headline.value'
        :style='{ fontSize: `${18-headline.value}px` }'
        class='clickable-item'
        :class='{
          headline: headline.value === 4,
          midheadline: headline.value === 5
        }'
      >
        {{ headline.title }}
      </div>
    </div>
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

const DEFAULT_HEADERS = [1, 2, 3]; // H2, H3, H4
const DEFAULT_HEADLINES = [
  { value: 4, title: 'frontend.shiki_editor.headlines.headline' },
  { value: 5, title: 'frontend.shiki_editor.headlines.midheadline' }
];
const headersHTML = DEFAULT_HEADERS.map(size => ({
  title: `H${size + 1}`,
  value: size
}));
const headlinesHTML = DEFAULT_HEADLINES.map(({ value, title }) => ({
  title: window.I18n.t(title),
  value
}));

function cancel() {
  emit('toggle', { isClosed: true });
}

function select({ target }) {
  if (target.classList.contains('clickable-item')) {
    emit('toggle', { size: target.getAttribute('data-value') });
  }
}
</script>

<style scoped lang='sass'>
@import ../../stylesheets/mixins/responsive

::v-deep(.popup-content)
  +gte_laptop
    min-width: 215px

::v-deep(.header)
  border: 1px solid
  cursor: pointer
  outline: 2px solid transparent
  padding: 2px
  position: relative
  text-align: center
  transition: outline .15s
  vertical-align: middle
  z-index: 1

  &:not(:last-child)
    margin-bottom: 7px

  +gte_laptop
    &:hover
      outline: 2px solid var(--link-hover-color, #dd5202)

  &:active
    outline: 2px solid var(--link-active-color, #ff0202)

  .h-text
    vertical-align: baseline
    display: inline-block
    height: 100%

::v-deep(.headline),
::v-deep(.midheadline)
  cursor: pointer
  width: auto
  max-width: 100%
  z-index: 1
  outline: 2px solid transparent

  +gte_laptop
    &:hover
      outline: 2px solid var(--link-hover-color, #dd5202)

  &:active
    outline: 2px solid var(--link-active-color, #ff0202)
</style>
