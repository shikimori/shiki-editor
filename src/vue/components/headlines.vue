<template>
  <div>
    <div
      v-if='isMobile'
      class='headlines mobile-fixed'
      :class='{ "is-sticky-menu-offset": isStickyMenuOffset }'
    >
      <div class='outer'>
        <div class='close' @click='close' />
        <PerfectScrollbar
          ref='scrollbar'
          :options='{ wheelPropagation: false }'
        >
          <div>
            <div
              @click='select'
            >
              <div
                v-for='headline in headersHTML'
                :key='headline.value'
                :title='headline.title'
                :data-value='headline.value'
                :style='{fontSize:`${18-headline.value * 1.2}px`}'
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
                :style='{fontSize:`${18-headline.value}px`}'
                class="clickable-item"
                :class="{headline: headline.value === 4, midheadline: headline.value === 5}"
              >
                {{ headline.title }}
              </div>
            </div>
          </div>
        </PerfectScrollbar>
      </div>
    </div>
    <div
      v-else
      ref='container'
      class='headlines b-tip b-tip--large b-tip--no_border'
    >
      <div data-popper-arrow />
      <div
        class='inner'
      >
        <div @click='select'>
          <div
            v-for='headline in headersHTML'
            :key='headline.value'
            :title='headline.title'
            :data-value='headline.value'
            :style='{fontSize:`${18-headline.value * 1.2}px`}'
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
            :style='{fontSize:`${18-headline.value}px`}'
            class="clickable-item"
            :class="{headline: headline.value === 4, midheadline: headline.value === 5}"
          >
            {{ headline.title }}
          </div>
        </div>
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

const DEFAULT_HEADERS = [1, 2, 3]; // H2, H3, H4
const DEFAULT_HEADLINES = [
  { value: 4, title: 'frontend.shiki_editor.headlines.headline' },
  { value: 5, title: 'frontend.shiki_editor.headlines.midheadline' }
];

export default {
  name: 'Headlines',
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
    headersHTML: DEFAULT_HEADERS.map(size => ({
      title: `H${size + 1}`,
      value: size
    })),
    headlinesHTML: DEFAULT_HEADLINES.map(({ value, title }) => ({
      title: window.I18n.t(title),
      value
    }))
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
      this.$emit('toggle', { isClosed: true });
    },
    select({ target }) {
      if (target.classList.contains('clickable-item')) {
        this.enablePageScroll();
        this.$emit('toggle', { size: target.getAttribute('data-value') });
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

function preventEvent(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
}
</script>

<style scoped lang='sass'>
@import ../../stylesheets/globals
@import ../../stylesheets/mixins/responsive
@import ../../stylesheets/mixins/icon
@import ../../stylesheets/mixins/input
@import ../../stylesheets/mixins/shiki_button

$padding-horizontal: 10px
$padding-vertical: 8px

.headlines
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
      width: 215px

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

::v-deep(.header)
  cursor: pointer
  margin-bottom: 7px
  margin-right: 7px
  outline: 2px solid transparent
  position: relative
  transition: outline .15s
  z-index: 1
  height: 32px
  width: 32px
  //border-radius: 5px
  display: inline-block
  border: 1px solid
  padding: 2px
  vertical-align: middle
  text-align: center

  +gte_laptop
    &:hover
      outline: 2px solid var(--link-hover-color, #dd5202)

  &:active
    outline: 2px solid var(--link-active-color, #ff0202)

::v-deep(.headline), ::v-deep(.midheadline)
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

::v-deep(.header)
  .h-text
    vertical-align: baseline
    display: inline-block
    height: 100%

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
