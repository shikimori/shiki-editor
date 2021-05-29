<template>
  <NodeViewWrapper class="code-block">
    <select v-model="selectedLanguage" contenteditable="false">
      <option :value="null">
        auto
      </option>
      <option disabled>
        —
      </option>
      <option v-for="(language, index) in languages" :key="index" :value="language">
        {{ language }}
      </option>
    </select>
    <pre><NodeViewContent as="code" /></pre>
  </NodeViewWrapper>
</template>

<script>
import {
  NodeViewWrapper,
  NodeViewContent,
  NodeViewProps
} from '../vue';

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent
  },
  props: nodeViewProps,
  data() {
    return {
      languages: this.extension.options.lowlight.listLanguages()
    };
  },
  computed: {
    selectedLanguage: {
      get() {
        return this.node.attrs.language;
      },
      set(language) {
        this.updateAttributes({ language });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.code-block {
  position: relative;
  select {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
}
</style>
