<template>
  <div>
    <Keypress
      v-if='isEnabled'
      key-event='keyup'
      :key-code='27'
      @success='close'
    />
    <div
      v-if='isMobile'
      class='smileys fixed'
      :class='{ "is-sticky-menu-offset": isStickyMenuOffset }'
    >
      <div class='outer'>
        <div class='close' @click='close' />
        <vue-custom-scrollbar
          v-if='smileysHTML'
          ref='scrollbar'
          :settings='{ wheelPropagation: false }'
        >
          <div
            @click='select'
            v-html='smileysHTML'
          />
        </vue-custom-scrollbar>
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

// import Keypress from 'vue-keypress';
// import vueCustomScrollbar from 'vue-custom-scrollbar';

// import { createPopper } from '@popperjs/core';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import offset from '@popperjs/core/lib/modifiers/offset';
import arrow from '@popperjs/core/lib/modifiers/arrow';

// import flip from '@popperjs/core/lib/modifiers/flip';

export default {
  name: 'Smileys',
  components: {
    Keypress: () => import(
      /* webpackChunkName: "smileys-dependencies" */ 'vue-keypress'
    ),
    vueCustomScrollbar: () => import(
      /* webpackChunkName: "smileys-dependencies" */ 'vue-custom-scrollbar'
    )
  },
  props: {
    isEnabled: { type: Boolean, required: true },
    shikiRequest: { type: Object, required: true },
    targetRef: { type: String, required: true },
    isStickyMenuOffset: { type: Boolean, required: true }
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
        this.$parent.$refs[this.targetRef][0].$el,
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
    async close() {
      if (this.isMobile) {
        const { enablePageScroll } = await import(
          /* webpackChunkName: "scroll-lock" */ 'scroll-lock'
        );
        enablePageScroll();
      }

      this.$emit('toggle');
    },
    select({ target }) {
      if (target.classList.contains('smiley')) {
        this.$emit('toggle', target.getAttribute('alt'));
      }
    }
  }
};
</script>

<style scoped lang='sass'>
@import ../stylesheets/mixins/responsive.sass
@import ../stylesheets/mixins/icon

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

  &.fixed
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

/deep/ .smiley
  cursor: pointer
  margin-right: 7px
  margin-bottom: 10px
  outline: 2px solid transparent
  transition: outline .15s

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
