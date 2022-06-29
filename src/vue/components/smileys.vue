<template>
  <PopupContent
    :is-loaded='!!smileysHTML'
    :is-enabled='isEnabled'
    :is-sticky-menu-offset='isStickyMenuOffset'
    :target-ref='targetRef'
    @close='emit("toggle")'
    @fetch='fetch'
  >
    <div
      @click='select'
      v-html='smileysHTML'
    />
  </PopupContent>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import PopupContent from './popup_content';

const props = defineProps({
  isEnabled: { type: Boolean, required: true },
  shikiRequest: { type: Object, required: true },
  targetRef: { type: Object, required: false, default: undefined },
  isStickyMenuOffset: { type: Boolean, required: true }
});
const emit = defineEmits(['toggle']);
const smileysHTML = ref(null);

async function fetch() {
  const { data } = await props.shikiRequest.get('smileys');
  smileysHTML.value = data
    .replace(/src="\//g, `src="${props.shikiRequest.origin}/`);
}

function select({ target }) {
  if (target.classList.contains('smiley')) {
    emit('toggle', target.getAttribute('alt'));
  }
}
</script>

<style scoped lang='sass'>
@import ../../stylesheets/mixins/responsive.sass

::v-deep(.popup-content)
  +gte_laptop
    min-height: 472px
    width: 492px

::v-deep(.smiley)
  cursor: pointer
  margin-bottom: 10px
  margin-right: 7px
  outline: 2px solid transparent
  position: relative
  transition: outline .15s
  z-index: 1

  +gte_laptop
    &:hover
      outline: 2px solid var(--link-hover-color, #dd5202)

  &:active
    outline: 2px solid var(--link-active-color, #ff0202)
</style>
