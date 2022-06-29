<template>
  <PopupContent
    :is-sticky-menu-offset='isStickyMenuOffset'
    :target-ref='targetRef'
    @close='cancel'
  >
    <div class='hex-wrapper'>
      <label class='hex-label'>
        {{ inputLabel }}:&nbsp;
        <input
          v-model='inputHex'
          class='hex-input'
          placeholder='#000000'
          @input='inputChange($event)'
          @change='inputChange($event)'
          @keydown='inputKeypress'
        >
      </label>
      <button
        :disabled='!isInputValid'
        class='hex-button'
        @click='submit()'
      >
        OK
      </button>
    </div>
    <div @click='select'>
      <div
        v-for='color in colorsHTML'
        :key='color.value'
        :style='{ backgroundColor: color.value, borderColor: color.border }'
        :title='color.title'
        :data-value='color.value'
        class='color'
      />
    </div>
  </PopupContent>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import PopupContent from './popup_content';
import { shadeColor, preventEvent } from '../../utils';

defineProps({
  targetRef: { type: Object, required: false, default: undefined },
  isStickyMenuOffset: { type: Boolean, required: true }
});
const emit = defineEmits(['toggle']);

// @see https://graf1x.com/list-of-colors-with-color-names/
const DEFAULT_COLORS = [
  { title: 'frontend.shiki_editor.colors.yellow', value: '#fff200' },
  { title: 'frontend.shiki_editor.colors.orange', value: '#fc6600' },
  { title: 'frontend.shiki_editor.colors.red', value: '#d30000' },
  { title: 'frontend.shiki_editor.colors.pink', value: '#fc0fc0' },
  { title: 'frontend.shiki_editor.colors.violet', value: '#b200de' },
  { title: 'frontend.shiki_editor.colors.blue', value: '#0018f9' },
  { title: 'frontend.shiki_editor.colors.green', value: '#3bb143' },
  { title: 'frontend.shiki_editor.colors.brown', value: '#7c4700' },
  { title: 'frontend.shiki_editor.colors.gray', value: '#828282' },
  { title: 'frontend.shiki_editor.colors.black', value: '#000000' }
];

const INPUT_MASK = /^(#[\da-f]+|\w+)$/i;
const colorsHTML = DEFAULT_COLORS.map(obj => ({
  ...obj,
  title: window.I18n.t(obj.title),
  border: shadeColor(obj.value, -40) // 40% darker color for border
}));
const inputLabel = window.I18n.t('frontend.shiki_editor.color');

const inputHex = ref('#000000');
const isInputValid = ref(true);

function inputKeypress(e) {
  if (e.keyCode === 13 && isInputValid.value) { // enter
    preventEvent(e);
    submit();
  }
}

function inputChange(event) {
  const value = `${event.target.value}`.trim();
  isInputValid.value = INPUT_MASK.test(value);
}

function select({ target }) {
  if (target.classList.contains('color')) {
    submit(target.getAttribute('data-value'));
  }
}

function submit(color = inputHex.value) {
  emit('toggle', { color: String(color).trim() });
}

function cancel() {
  emit('toggle', { isClosed: true });
}
</script>

<style scoped lang='sass'>
@import ../../stylesheets/globals
@import ../../stylesheets/mixins/responsive
@import ../../stylesheets/mixins/icon
@import ../../stylesheets/mixins/input
@import ../../stylesheets/mixins/shiki_button

::v-deep(.popup-content)
  +gte_laptop
    min-height: 40px
    width: 371px

::v-deep(.color)
  border-radius: 5px
  border: 2px solid
  cursor: pointer
  display: inline-block
  height: 28px
  margin-bottom: 7px
  margin-right: 7px
  outline: 2px solid transparent
  position: relative
  transition: outline .15s
  width: 28px
  z-index: 1

  +gte_laptop
    &:hover
      outline: 2px solid var(--link-hover-color, #dd5202)

  &:active
    outline: 2px solid var(--link-active-color, #ff0202)

.hex-input
  +input-colors

  height: 23px

.hex-label
  font-weight: bold

.hex-button
  +shiki_button

  margin-left: 5px

.hex-wrapper
  box-sizing: border-box
  display: block
  margin-bottom: 10px
  min-height: 28px
  padding: 5px
</style>
