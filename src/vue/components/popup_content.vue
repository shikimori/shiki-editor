<template>
  <div
    v-if='isMobile'
    class='popup-content mobile-fixed'
    :class='{ "is-sticky-menu-offset": isStickyMenuOffset }'
  >
    <div class='outer'>
      <div class='close' @click='close' />
      <PerfectScrollbar
        v-if='isLoaded'
        ref='scrollbar'
        :options='{ wheelPropagation: false }'
      >
        <slot />
      </PerfectScrollbar>
      <div v-else class='b-ajax' />
    </div>
  </div>
  <div
    v-else
    ref='container'
    class='smileys b-tip b-tip--large b-tip--no_border'
  >
    <div data-popper-arrow />
    <div v-if='isLoaded' class='inner'><slot /></div>
    <div v-else class='b-ajax' />
  </div>
  <div v-if='!isMobile' class='shade' @click='close' />
</template>

<script setup>
import {
  defineAsyncComponent,
  defineEmits,
  defineProps,
  ref
} from 'vue';
// import { defineAsyncComponent, getCurrentInstance, toRefs } from 'vue';

import { isMobile } from 'shiki-utils';

const scrollbar = ref(null);
const emit = defineEmits(['close']);
const PerfectScrollbar = defineAsyncComponent(() => import(
  /* webpackChunkName: "smileys-dependencies" */ 'vue3-perfect-scrollbar'
));

defineProps({
  isLoaded: { type: Boolean, required: true },
  isStickyMenuOffset: { type: Boolean, required: true }
});

function close() {
  enablePageScroll();
  emit('close');
}

async function enablePageScroll() {
  if (isMobile) {
    const { enablePageScroll } = await import(
      /* webpackChunkName: "scroll-lock" */ 'scroll-lock'
    );
    enablePageScroll();
  }
}
</script>

<style scoped lang='sass'>
@import ../../stylesheets/mixins/responsive.sass

$padding-horizontal: 10px
$padding-vertical: 8px

.popup-content
  background: #fff
  z-index: 40

  &.b-tip
    padding: 0
    position: relative

    +lte_ipad
      width: calc(100vw - #{$padding-horizontal * 2})
      max-width: 492px
      min-height: 238px

    +gte_laptop
      min-height: 472px
      width: 492px

    .inner
      padding: $padding-vertical $padding-horizontal

      +lte_ipad
        max-height: calc(100vh - 98px)

  &.mobile-fixed
    height: 100%
    left: 0
    position: fixed
    top: 0
    width: 100%

    +lte_ipad
      display: flex
      flex-direction: column
      padding: 16px 0 16px 16px

      &.is-sticky-menu-offset
        top: var(--top-menu-height, 0px)
        height: calc(100% - var(--top-menu-height, 0px))

      .outer
        display: flex
        flex-direction: column
        height: 100%

        .ps
          padding-right: 16px

  +gte_laptop
    .inner
      overflow-y: auto
      max-height: 100%

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

<style src='vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.min.css' />
