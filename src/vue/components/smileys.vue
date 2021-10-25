<template>
  <div>
    <div
      v-if='isMobile'
      class='smileys mobile-fixed'
      :class='{ "is-sticky-menu-offset": isStickyMenuOffset }'
    >
      <div class='outer'>
        <div class='close' @click='close' />
        <PerfectScrollbar
          v-if='smileysHTML'
          ref='scrollbar'
          :options='{ wheelPropagation: false }'
        >
          <div
            @click='select'
            v-html='smileysHTML'
          />
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
      <div
        v-if='smileysHTML'
        class='inner'
        @click='select'
        v-html='smileysHTML'
      />
      <div v-else class='b-ajax' />
    </div>
    <div v-if='!isMobile' class='shade' @click='close' />
  </div>
</template>

<script>
import { isMobile } from 'shiki-utils';
import { defineAsyncComponent, getCurrentInstance, toRefs } from 'vue';
import { useKeypress } from 'vue3-keypress';

import { createPopper } from '@popperjs/core/lib/popper-lite';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import offset from '@popperjs/core/lib/modifiers/offset';
import arrow from '@popperjs/core/lib/modifiers/arrow';

// import flip from '@popperjs/core/lib/modifiers/flip';

export default {
  name: 'Smileys',
  components: {
    PerfectScrollbar: defineAsyncComponent(() => import(
      /* webpackChunkName: "smileys-dependencies" */ 'vue3-perfect-scrollbar'
    ))
  },
  props: {
    isEnabled: { type: Boolean, required: true },
    shikiRequest: { type: Object, required: true },
    targetRef: { type: String, required: true },
    isStickyMenuOffset: { type: Boolean, required: true }
  },
  setup(props) {
    const { isEnabled } = toRefs(props);
    const internalInstance = getCurrentInstance();

    useKeypress({
      keyEvent: 'keyup',
      keyBinds: [{
        keyCode: 27,
        success: () => {
          internalInstance.ctx.close();
        }
      }],
      isActive: isEnabled
    });
  },
  data: () => ({
    popup: null,
    smileysHTML: null
  }),
  computed: {
    isMobile() {
      return isMobile();
    }
  },
  watch: {
    isEnabled() {
      if (this.isEnabled) {
        this.show();
      } else {
        this.cleanup();
      }
    }
  },
  created() {
    window.addEventListener('keyup', this.handler);
  },
  mounted() {
    if (this.isEnabled) {
      this.show();
    }
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    async show() {
      if (this.isMobile) {
        const { disablePageScroll } = await import(
          /* webpackChunkName: "scroll-lock" */ 'scroll-lock'
        );
        console.log('disablePageScroll');
        disablePageScroll();
      } else {
        this.showPopup();
      }

      if (!this.smileysHTML) {
        this.fetch();
      }
    },
    cleanup() {
      if (this.popup) {
        this.popup.destroy();
        this.popup = null;
      }
    },
    async fetch() {
      const { data } = await this.shikiRequest.get('smileys');
      this.smileysHTML = data.replace(/src="\//g, `src="${this.shikiRequest.origin}/`);

      if (this.popup) {
        await this.$nextTick();
        this.popup.update();
      }
    },
    showPopup() {
      this.popup = createPopper(
        this.$parent.$refs[this.targetRef].$el,
        this.$refs.container,
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
    },
    close() {
      this.enablePageScroll();
      this.$emit('toggle');
    },
    select({ target }) {
      if (target.classList.contains('smiley')) {
        this.enablePageScroll();
        this.$emit('toggle', target.getAttribute('alt'));
      }
    },
    async enablePageScroll() {
      if (this.isMobile) {
        const { enablePageScroll } = await import(
          /* webpackChunkName: "scroll-lock" */ 'scroll-lock'
        );
        enablePageScroll();
      }
    }
  }
};
</script>

<style scoped lang='sass'>
@import ../../stylesheets/mixins/responsive.sass
@import ../../stylesheets/mixins/icon

$padding-horizontal: 10px
$padding-vertical: 8px

.smileys
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

.close
  +icon
  height: 30px !important
  position: absolute
  display: flex
  align-items: center
  justify-content: center
  right: 5px
  top: 5px
  width: 30px !important
  background: #fff
  border-radius: 30px
  z-index: 2

  &:before
    content: '\e828'
    font-size: 16px

.b-ajax
  width: calc(100% - #{$padding-horizontal * 2})
  height: calc(100% - #{$padding-horizontal * 2})
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
