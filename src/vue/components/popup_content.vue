<template>
  <div>
    <div
      v-if='isMobile'
      class='popup-content mobile-fixed'
      :class='{ "is-sticky-menu-offset": isStickyMenuOffset }'
    >
      <div class='outer'>
        <div class='mobile-close' @click='close' />
        <PerfectScrollbar
          v-if='isLoaded'
          :options='{ wheelPropagation: false }'
        >
          <slot />
        </PerfectScrollbar>
        <div v-else class='b-ajax' />
      </div>
    </div>
    <div
      v-else
      ref='desktopContainerNode'
      class='popup-content b-tip b-tip--large b-tip--no_border'
    >
      <div data-popper-arrow />
      <div class='desktop-inner'>
        <slot v-if='isLoaded' />
        <div v-else class='b-ajax' />
      </div>
    </div>
    <div v-if='!isMobile' class='shade' @click='close' />
  </div>
</template>

<script setup>
import {
  defineAsyncComponent,
  defineEmits,
  defineProps,
  onBeforeUnmount,
  onMounted,
  ref,
  toRefs,
  watch
} from 'vue';
import { useKeypress } from 'vue3-keypress';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import offset from '@popperjs/core/lib/modifiers/offset';
import arrow from '@popperjs/core/lib/modifiers/arrow';

import { isMobile as isMobileCheck } from 'shiki-utils';

const isMobile = isMobileCheck();
const desktopContainerNode = ref(null);
const emit = defineEmits(['fetch', 'close']);
const PerfectScrollbar = defineAsyncComponent(() => import(
  /* webpackChunkName: "vue3-perfect-scrollbar" */ 'vue3-perfect-scrollbar'
));

const props = defineProps({
  isEnabled: { type: Boolean, required: false, default: true },
  isLoaded: { type: Boolean, required: false, default: true },
  isStickyMenuOffset: { type: Boolean, required: true },
  targetRef: { type: Object, required: false, default: undefined }
});
const popup = ref(null);
const { isEnabled, isLoaded } = toRefs(props);

watch(isEnabled, () => {
  if (isEnabled.value) {
    show();
  } else {
    cleanup();
  }
});

watch(isLoaded, () => {
  if (!popup.value) { return; }
  popup.value.update();
});

onMounted(() => isEnabled.value && show());
onBeforeUnmount(cleanup);

useKeypress({
  keyEvent: 'keyup',
  keyBinds: [{ keyCode: 27, success: close }],
  isActive: isEnabled
});

function show() {
  if (isMobile) {
    disablePageScroll();
  } else {
    showPopper();
  }

  if (!isLoaded.value) {
    emit('fetch');
  }
}

function showPopper() {
  // const { createPopper } = await import(
  //   /* webpackChunkName: "popperjs" */
  //   '@popperjs/core/lib/popper-lite'
  // );
  // const { default: preventOverflow } = await import(
  //   /* webpackChunkName: "popperjs" */
  //   '@popperjs/core/lib/modifiers/preventOverflow'
  // );
  // const { default: offset } = await import(
  //   /* webpackChunkName: "popperjs" */
  //   '@popperjs/core/lib/modifiers/offset'
  // );
  // const { default: arrow } = await import(
  //   /* webpackChunkName: "popperjs" */
  //   '@popperjs/core/lib/modifiers/arrow'
  // );
  // import flip from '@popperjs/core/lib/modifiers/flip';

  popup.value ||= createPopper(
    props.targetRef.$el || props.targetRef[0].$el,
    desktopContainerNode.value,
    {
      placement: 'bottom',
      modifiers: [preventOverflow, offset, arrow, {
        name: 'preventOverflow',
        options: { padding: 10 }
      }, {
        name: 'offset',
        options: { offset: [0, 8] }
      }]
    }
  );
}

function close() {
  emit('close');
}

function cleanup() {
  if (isMobile) {
    enablePageScroll();
  }

  if (popup.value) {
    popup.value.destroy();
    popup.value = null;
  }
}

async function disablePageScroll() {
  const { disablePageScroll } = await import(
    /* webpackChunkName: "scroll-lock" */ 'scroll-lock'
  );
  disablePageScroll();
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
@import ../../stylesheets/mixins/icon

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

  +gte_laptop
    min-height: 100px
    min-width: 320px

  .desktop-inner
    +gte_laptop
      padding: $padding-vertical $padding-horizontal
      overflow-y: auto
      max-height: 100%

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

.mobile-close
  +icon
  align-items: center
  background: #fff
  border-radius: 30px
  display: flex
  height: 30px !important
  justify-content: center
  position: absolute
  right: 5px
  top: 5px
  width: 30px !important
  z-index: 2

  &:before
    content: '\e828'
    font-size: 16px

.b-ajax
  height: calc(100% - #{$padding-horizontal * 2})
  width: calc(100% - #{$padding-horizontal * 2})

  +gte_laptop
    position: absolute

.shade
  background: rgba(#061b42, 0.35)
  height: 100%
  left: 0
  position: fixed
  top: 0
  width: 100%
  z-index: 39
</style>

<style src='vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.min.css' />
