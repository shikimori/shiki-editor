<template>
  <div>
    <div
      v-if='isMobile'
      class='colors mobile-fixed'
      :class='{ "is-sticky-menu-offset": isStickyMenuOffset }'
    >
      <div class='outer'>
        <div class='close' @click='close' />
        <PerfectScrollbar
          ref='scrollbar'
          :options='{ wheelPropagation: false }'
        >
          <div
            @click='select'
          >
            <div
              v-for='color in colorsHTML'
              :key='color.value'
              :style='{backgroundColor: color.value, borderColor: color.border}'
              :title="color.title"
              :data-value="color.value"
              class="color"
            />
          </div>
        </PerfectScrollbar>
      </div>
    </div>
    <div
      v-else
      ref='container'
      class='colors b-tip b-tip--large b-tip--no_border'
    >
      <div data-popper-arrow />
      <div
        class='inner'
        @click='select'
      >
        <div
          v-for='color in colorsHTML'
          :key='color.value'
          :style='{backgroundColor: color.value, borderColor: color.border}'
          :title="color.title"
          :data-value="color.value"
          class="color"
        />
      </div>
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

// @see https://graf1x.com/list-of-colors-with-color-names/
const DEFAULT_COLORS = [
  { title: 'fontent.shiki_editor.colors.yellow', value: '#fff200', border: '#f8de7e' },
  { title: 'fontent.shiki_editor.colors.orange', value: '#fc6600', border: '#f9a602' },
  { title: 'fontent.shiki_editor.colors.red', value: '#d30000', border: '#fa8072' },
  { title: 'fontent.shiki_editor.colors.pink', value: '#fc0fc0', border: '#e0115f' },
  { title: 'fontent.shiki_editor.colors.violet', value: '#b200de', border: '#b43757' },
  { title: 'fontent.shiki_editor.colors.blue', value: '#0018f9', border: '#131e3a' },
  { title: 'fontent.shiki_editor.colors.green', value: '#3bb143', border: '#0b6623' },
  { title: 'fontent.shiki_editor.colors.brown', value: '#7c4700', border: '#4b3a26' },
  { title: 'fontent.shiki_editor.colors.gray', value: '#828282', border: '#787276' },
  { title: 'fontent.shiki_editor.colors.black', value: '#000000', border: '#000000' }
];

export default {
  name: 'Colors',
  components: {
    PerfectScrollbar: defineAsyncComponent(() => import(
        /* webpackChunkName: "smileys-dependencies" */ 'vue3-perfect-scrollbar'
    ))
  },
  props: {
    isEnabled: { type: Boolean, required: true },
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
    colorsHTML: DEFAULT_COLORS.map(obj => ({ ...obj, title: window.I18n.t(obj.title) }))
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
    },
    cleanup() {
      if (this.popup) {
        this.popup.destroy();
        this.popup = null;
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
      if (target.classList.contains('color')) {
        this.enablePageScroll();
        this.$emit('toggle', target.getAttribute('data-value'));
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

.colors
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
      min-height: 40px
      width: 371px

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

::v-deep(.color)
  cursor: pointer
  margin-bottom: 10px
  margin-right: 7px
  outline: 2px solid transparent
  position: relative
  transition: outline .15s
  z-index: 1
  height: 32px
  width: 32px
  border-radius: 50%
  display: inline-block
  border: 4px solid

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

.shade
  background: rgba(#061b42, 0.35)
  height: 100%
  left: 0
  position: fixed
  top: 0
  width: 100%
  z-index: 39
</style>

<style src='vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.min.css'/>
