<template>
  <div>
    <div
      v-if='isMobile'
      class='popup-content mobile-fixed'
      :class='{ "is-sticky-menu-offset": isStickyMenuOffset }'
    >
      <div class='outer'>
        <div class='close' @click='close' />
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
      class='smileys b-tip b-tip--large b-tip--no_border'
    >
      <div data-popper-arrow />
      <div v-if='isLoaded' class='inner'><slot /></div>
      <div v-else class='b-ajax' />
    </div>
    <div v-if='!isMobile' class='shade' @click='close' />
  </div>
</template>

<script setup>
import {
  defineAsyncComponent,
  defineEmits,
  defineProps,
  onMounted,
  onBeforeUnmount,
  ref,
  watch
} from 'vue';
// import { defineAsyncComponent, getCurrentInstance, toRefs } from 'vue';

import { isMobile as isMobileCheck } from 'shiki-utils';

const isMobile = isMobileCheck();
const desktopContainerNode = ref(null);
const emit = defineEmits(['fetch', 'close']);
const PerfectScrollbar = defineAsyncComponent(() => import(
  /* webpackChunkName: "vue3-perfect-scrollbar" */ 'vue3-perfect-scrollbar'
));

const props = defineProps({
  isEnabled: { type: Boolean, required: true },
  isLoaded: { type: Boolean, required: true },
  isStickyMenuOffset: { type: Boolean, required: true },
  targetRef: { type: Object, required: false, default: undefined }
});
const popup = ref(null);

watch(() => props.isEnabled, () => {
  if (props.isEnabled) {
    show();
  } else {
    cleanup();
  }
});

onMounted(() => props.isEnabled && show());
onBeforeUnmount(cleanup);

async function show() {
  if (isMobile) {
    const { disablePageScroll } = await import(
      /* webpackChunkName: "scroll-lock" */ 'scroll-lock'
    );
    disablePageScroll();
  } else {
    showPopper();
  }

  if (!props.isLoaded) {
    emit('fetch');
  }
}

async function showPopper() {
  const { createPopper } = await import(
    /* webpackChunkName: "popperjs" */
    '@popperjs/core/lib/popper-lite'
  );
  const { default: preventOverflow } = await import(
    /* webpackChunkName: "popperjs" */
    '@popperjs/core/lib/modifiers/preventOverflow'
  );
  const { default: offset } = await import(
    /* webpackChunkName: "popperjs" */
    '@popperjs/core/lib/modifiers/offset'
  );
  const { default: arrow } = await import(
    /* webpackChunkName: "popperjs" */
    '@popperjs/core/lib/modifiers/arrow'
  );
  // import flip from '@popperjs/core/lib/modifiers/flip';

  popup.value = createPopper(
    props.targetRef[0].$el,
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
  enablePageScroll();
  emit('close');
}

function cleanup() {
  if (!popup.value) { return; }

  popup.value.destroy();
  popup.value = null;
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
