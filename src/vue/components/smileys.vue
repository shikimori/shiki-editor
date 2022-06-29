<template>
  <PopupContent
    :is-enabled='isEnabled'
    :is-loaded='!!smileysHTML'
    :is-sticky-menu-offset='isStickyMenuOffset'
  >
    <div
      @click='select'
      v-html='smileysHTML'
    />
  </PopupContent>
</template>

<script setup>
import { defineProps, ref } from 'vue';
import PopupContent from './popup_content';

const props = defineProps({
  isEnabled: { type: Boolean, required: true },
  shikiRequest: { type: Object, required: true },
  targetRef: { type: String, required: true },
  isStickyMenuOffset: { type: Boolean, required: true }
});
const smileysHTML = ref(null);

// import { isMobile } from 'shiki-utils';
// import { getCurrentInstance, toRefs } from 'vue';
// import { useKeypress } from 'vue3-keypress';
//
// // import popupcontent from './popup_content';
//
// import { createPopper } from '@popperjs/core/lib/popper-lite';
// import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
// import offset from '@popperjs/core/lib/modifiers/offset';
// import arrow from '@popperjs/core/lib/modifiers/arrow';
//
// // import flip from '@popperjs/core/lib/modifiers/flip';
//
// export default {
//   name: 'Smileys',
//   components: {
//     PopupContent
//   },
//   props: {
//     isEnabled: { type: Boolean, required: true },
//     shikiRequest: { type: Object, required: true },
//     targetRef: { type: String, required: true },
//     isStickyMenuOffset: { type: Boolean, required: true }
//   },
//   setup(props) {
//     const { isEnabled } = toRefs(props);
//     const internalInstance = getCurrentInstance();
//
//     useKeypress({
//       keyEvent: 'keyup',
//       keyBinds: [{
//         keyCode: 27,
//         success: () => {
//           internalInstance.ctx.close();
//         }
//       }],
//       isActive: isEnabled
//     });
//   },
//   data: () => ({
//     popup: null,
//     smileysHTML: null,
//     isMobile: isMobile()
//   }),
//   created() {
//     window.addEventListener('keyup', this.handler);
//   },
//   methods: {
//     async fetch() {
//       const { data } = await this.shikiRequest.get('smileys');
//       this.smileysHTML = data.replace(/src="\//g, `src="${this.shikiRequest.origin}/`);
//
//       if (this.popup) {
//         await this.$nextTick();
//         this.popup.update();
//       }
//     },
//     close() {
//       this.enablePageScroll();
//       this.$emit('toggle');
//     },
//     select({ target }) {
//       if (target.classList.contains('smiley')) {
//         this.enablePageScroll();
//         this.$emit('toggle', target.getAttribute('alt'));
//       }
//     },
//     async enablePageScroll() {
//       if (this.isMobile) {
//         const { enablePageScroll } = await import(
//           /* webpackChunkName: "scroll-lock" */ 'scroll-lock'
//         );
//         enablePageScroll();
//       }
//     }
//   }
// };
</script>

<style scoped lang='sass'>
@import ../../stylesheets/mixins/responsive.sass
@import ../../stylesheets/mixins/icon

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
