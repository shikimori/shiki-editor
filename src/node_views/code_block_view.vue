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
import pDefer from 'p-defer';
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '../vue';

const LANGUAGE_ALIASES = {
  'js': 'javascript',
  'sass': 'scss'
};

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
        return LANGUAGE_ALIASES[this.node.attrs.language] || this.node.attrs.language;
      },
      set(language) {
        this.updateAttributes({ language });
      }
    }
  },
  async mounted() {
    if (this.extension.options.lowlight) { return; }

    if (!this.extension.options.lowlightPromise) {
      const deferred = pDefer();
      this.extension.options.lowlightPromise = deferred.promise;

      Promise.all([
        import(/* webpackChunkName: "lowlight" */ 'lowlight/lib/core'),
        import(/* webpackChunkName: "lowlight" */ '../plugins/lowlight/build_plugin'),
        import(/* webpackChunkName: "lowlight" */ '../utils/lowlight/shiki_markdown'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/javascript'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/css'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/json'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/less'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/php'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/python'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/ruby'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/scss'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/typescript'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/xml'),
        import(/* webpackChunkName: "lowlight" */ 'highlight.js/lib/languages/yaml')
      ])
        .then(([
          { lowlight },
          { default: buildLowlightPlugin },
          { default: shikiMarkdown },
          { default: javascript },
          { default: css },
          { default: json },
          { default: less },
          { default: php },
          { default: python },
          { default: ruby },
          { default: scss },
          { default: typescript },
          { default: xml },
          { default: yaml }
        ]) => {
          this.extension.options.lowlight = lowlight;

          lowlight.registerLanguage('shiki', shikiMarkdown);

          lowlight.registerLanguage('javascript', javascript);
          lowlight.registerLanguage('css', css);
          lowlight.registerLanguage('json', json);
          lowlight.registerLanguage('less', less);
          lowlight.registerLanguage('php', php);
          lowlight.registerLanguage('python', python);
          lowlight.registerLanguage('ruby', ruby);
          lowlight.registerLanguage('scss', scss);
          lowlight.registerLanguage('typescript', typescript);
          lowlight.registerLanguage('xml', xml);
          lowlight.registerLanguage('yaml', yaml);

          Object.keys(LANGUAGE_ALIASES).forEach(alias => {
            lowlight.registerAlias(LANGUAGE_ALIASES[alias], alias);
          });

          this.editor.registerPlugin(
            buildLowlightPlugin(this.extension.name, lowlight)
          );
          deferred.resolve();
        });
    }

    await this.extension.options.lowlightPromise;
    this.languages = this.extension.options.lowlight?.listLanguages();
  }
};
</script>

<style scoped lang='sass'>
</style>
