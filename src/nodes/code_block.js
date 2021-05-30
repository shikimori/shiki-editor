import { textblockTypeInputRule } from 'prosemirror-inputrules';

import { Node } from '../base';
import { nodeIsActive } from '../checks';
import { toggleBlockType } from '../commands';
// import { buildLowlightPlugin } from '../plugins';
import { CodeBlockView } from '../node_views';
import VuewNodeView from '../vue/node_view';

// // import { lowlight } from 'lowlight/lib/core';
// import { lowlight } from 'lowlight/lib/common';

export default class CodeBlock extends Node {
  get name() {
    return 'code_block';
  }

  get defaultOptions() {
    return {
      lowlight: null,
      lowlightPromise: null
    };
  }

  get schema() {
    return {
      content: 'text*',
      group: 'block',
      code: true,
      isolating: true,
      defining: true,
      draggable: false,
      marks: '',
      attrs: {
        language: { default: '' }
      },
      parseDOM: [{
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: node => ({
          language: node.getAttribute('data-language') || ''
        })
      }],
      toDOM(node) {
        return [
          'pre',
          { class: 'b-code-v2', 'data-language': node.attrs.language || '' },
          ['code', 0]
        ];
      }
    };
  }

  commands({ schema, type }) {
    return () => toggleBlockType(type, schema.nodes.paragraph);
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  get view() {
    return VuewNodeView.buildRenderer(CodeBlockView);
  }

  inputRules({ type }) {
    return [
      textblockTypeInputRule(/^```\w* $/, type, match => ({
        language: match[0].match(/`+(\w*)/)[1] || ''
      }))
    ];
  }

  // get plugins() {
  //   return [buildLowlightPlugin(this.name, lowlight)];
  // }

  markdownSerialize(state, node) {
    state.write('```' + (node.attrs.language || '') + '\n');
    state.text(node.textContent.replace(/`/g, '\\`'), false);
    state.ensureNewLine();
    state.write('```');
    state.closeBlock(node);
  }
}
