<template>
  <span
    class='b-image'
    :class='[customClass, {
      "is-prosemirror-selected": isSelected,
      "b-poster": isPoster,
      "check-width": isCheckWidth,
      "no-zoom": node.attrs.isNoZoom || isPoster,
    }]'
    :data-attrs='serializedAttributes'
    :data-image='tagPreview'
    @click='select'
  >
    <div class='controls'>
      <a class='prosemirror-open' :href='node.attrs.src' target='_blank' />
      <div v-if='isPoster' class='collapse' @click='collapse' />
      <div v-else-if='isExpandable' class='prosemirror-expand' @click='expand' />
      <div class='delete' @click='remove' />
    </div>
    <img
      ref='image'
      :src='node.attrs.src'
      :width='width'
      :height='height'
    >
  </span>
</template>

<script>
import imagePromise from 'image-promise';
import { NodeSelection } from 'prosemirror-state';

import { tagSequence } from '../nodes/image';

export default {
  name: 'ImageView',
  props: {
    editor: { type: Object, required: true },
    node: { type: Object, required: true },
    getPos: { type: Function, required: true },
    view: { type: Object, required: true },
    isSelected: { type: Boolean, required: true },
    updateAttrs: { type: Function, required: true }
  },
  data: () => ({
    isLoaded: false,
    naturalWidth: undefined,
    imageWidth: undefined
  }),
  computed: {
    isCheckWidth() {
      return !this.isPoster &&
        !this.node.attrs.width &&
        !this.node.attrs.height;
    },
    isPoster() {
      return this.node.attrs.isPoster;
    },
    customClass() {
      return this.node.attrs.class;
    },
    width() {
      if (this.isPoster) { return null; }
      return this.node.attrs.width;
    },
    height() {
      if (this.isPoster) { return null; }
      return this.node.attrs.height;
    },
    serializedAttributes() {
      return JSON.stringify(this.node.attrs);
    },
    isExpandable() {
      if (!this.isLoaded) { return false; }
      return this.naturalWidth > this.imageWidth;
    },
    tagPreview() {
      return tagSequence(this.node);
    }
  },
  async mounted() {
    await imagePromise(this.$refs.image);
    if (!this.$refs.image) { return; } // becase component can be already unmounted

    this.isLoaded = true;
    this.naturalWidth = this.$refs.image.naturalWidth;
    this.imageWidth = this.$refs.image.width;
  },
  methods: {
    remove(e) {
      e.stopImmediatePropagation();

      this.view.dispatch(
        this.view.state.tr.delete(
          this.getPos(),
          this.getPos() + 1
        )
      );
      this.editor.focus();
    },
    select() {
      this.view.dispatch(
        this.view.state.tr.setSelection(
          new NodeSelection(this.view.state.tr.doc.resolve(this.getPos()))
        )
      );
    },
    expand() {
      this.updateAttrs({ ...this.node.attrs, isPoster: true });
    },
    collapse() {
      this.updateAttrs({ ...this.node.attrs, isPoster: false });
      // have to update image width when animation is completed
      setTimeout(() => this.imageWidth = this.$refs.image.width, 350);
    }
  }
};
</script>

<style scoped lang='sass'>
.b-image
  img
    transition: max-width .25s
</style>
