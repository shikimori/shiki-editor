<template>
  <div>
    <Keypress
      v-if='isEnabled'
      key-event='keyup'
      :key-code='27'
      @success='close'
    />
    <div ref='container' class='smileys'>
      <div ref='arrow' class='arrow' />
      <div
        v-if='smileysHTML'
        class='inner'
        @click='select'
        v-html='smileysHTML'
      />
      <div v-else class='b-ajax' />
    </div>
    <div class='shade' @click='close' />
  </div>
</template>

<script>
import Keypress from 'vue-keypress';
// import { createPopper } from '@popperjs/core';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import offset from '@popperjs/core/lib/modifiers/offset';
import arrow from '@popperjs/core/lib/modifiers/arrow';

import axios from 'axios';
// import flip from '@popperjs/core/lib/modifiers/flip';

const SMILEYS_PATH = 'comments/smileys';

export default {
  name: 'Smileys',
  components: { Keypress },
  props: {
    baseUrl: { type: String, required: true },
    isEnabled: { type: Boolean, required: true },
    targetRef: { type: String, required: true }
  },
  data: () => ({
    popper: null,
    smileysHTML: null
  }),
  watch: {
    isEnabled() {
      if (this.isEnabled) {
        this.show();
      } else {
        this.hide();
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
  methods: {
    show() {
      this.popper = createPopper(
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
          }, {
            name: 'arrow',
            options: { element: this.$refs.arrow }
          }]
        }
      );
      if (!this.smileysHTML) {
        this.fetch();
      }
    },
    hide() {
      this.popper.destroy();
      this.popper = null;
    },
    async fetch() {
      const { data } = await axios.get(`${this.baseUrl}/${SMILEYS_PATH}`);
      this.smileysHTML = data.replace(/src="\//g, `src="${this.baseUrl}/`);
      await this.$nextTick();
      this.popper.update();
    },
    close() {
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
@import ../stylesheets/responsive.sass

$padding-horizontal: 10px
$padding-vertical: 8px

.smileys
  background: #fff
  font-size: 13px
  position: relative
  z-index: 20

  +lte_ipad
    width: calc(100vw - #{$padding-horizontal * 2})
    max-width: 492px
    min-height: 238px

  +gte_laptop
    min-height: 472px
    width: 492px

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

  .inner
    overflow-y: auto
    overscroll-behavior: none
    padding: $padding-vertical $padding-horizontal

    +lte_ipad
      max-height: calc(100vh - 98px)

  &[data-popper-placement^='top'] > .arrow
    bottom: -4px
  &[data-popper-placement^='bottom'] > .arrow
    top: -4px
  &[data-popper-placement^='left'] > .arrow
    right: -4px
  &[data-popper-placement^='right'] > .arrow
    left: -4px

.b-ajax
  width: calc(100% - #{$padding-horizontal * 2})
  height: calc(100% - #{$padding-horizontal * 2})
  position: absolute

.arrow
  height: 8px
  width: 8px

  &::before
    background: #fff
    content: ''
    height: 100%
    transform: rotate(45deg)
    width: 100%
    position: absolute
    z-index: -1

.shade
  background: rgba(#061b42, 0.35)
  height: 100%
  left: 0
  position: fixed
  top: 0
  width: 100%
  z-index: 19
</style>
