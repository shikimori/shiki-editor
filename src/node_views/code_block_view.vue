<template>
  <NodeViewWrapper class='code-block'>
    <select
      v-if='isLowlightInitialized'
      v-model='selectedLanguage'
      contenteditable='false'
    >
      <option :value='""'>none</option>
      <option disabled>—</option>
      <option
        v-for='(language, index) in languages'
        :key='index'
        :value='language'
      >
        {{ language }}
      </option>
    </select>
    <pre class='b-code-v2' v-bind='codeLanguage'><NodeViewContent as='code' /></pre>
  </NodeViewWrapper>
</template>

<script>
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '../vue';
import buildLowlightPlugin from '../plugins/lowlight/build_plugin';

export default {
  components: { NodeViewWrapper, NodeViewContent },
  props: nodeViewProps,
  data() {
    return {
      languages: this.extension.options.lowlight?.listLanguages()
    };
  },
  computed: {
    isLowlightInitialized() {
      return !!this.languages;
    },
    codeLanguage() {
      if (this.isLowlightInitialized) {
        return {};
      }
      return { 'data-language': this.selectedLanguage };
    },
    selectedLanguage: {
      get() {
        return this.node.attrs.language;
      },
      set(language) {
        this.updateAttributes({ language });
      }
    }
  },
  async mounted() {
    if (this.extension.options.lowlight) { return; }

    if (!this.extension.options.lowlightPromise) {
      this.extension.options.lowlightPromise = import(/* webpackChunkName: "lowlight" */
        'lowlight/lib/common'
      ).then(({ lowlight }) => {
        this.extension.options.lowlight = lowlight;

        this.editor.registerPlugin(
          buildLowlightPlugin(this.extension.name, lowlight)
        );
      });
    }

    await this.extension.options.lowlightPromise;
    this.languages = this.extension.options.lowlight?.listLanguages();
  }
};
</script>

<style scoped lang='sass'>
</style>
