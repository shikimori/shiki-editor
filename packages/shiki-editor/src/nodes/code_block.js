import { textblockTypeInputRule } from 'prosemirror-inputrules';

import { Node } from '../base';
import { nodeIsActive } from '../checks';
import { toggleBlockType } from '../commands';

export default class CodeBlock extends Node {
  get name() {
    return 'code_block';
  }

  get schema() {
    return {
      content: 'text*',
      group: 'block',
      code: true,
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
          { class: 'b-code_block', 'data-language': node.attrs.language || '' },
          ['code', 0]
        ];
      }
    };
  }

  commands({ schema, type }) {
    return () => toggleBlockType(type, schema.nodes.paragraph, {});
  }

  activeCheck(type, state) {
    return nodeIsActive(type, state);
  }

  inputRules({ type }) {
    return [
      textblockTypeInputRule(/^```\w* $/, type, match => ({
        language: match[0].match(/`+(\w*)/)[1] || ''
      }))
    ];
  }

  markdownSerialize(state, node) {
    // state.renderBlock(
    //   node,
    //   'code',
    //   node.attrs.language ? `=${node.attrs.language}` : ''
    // );
    state.write('```' + (node.attrs.language || '') + '\n');
    state.text(node.textContent, false);
    state.ensureNewLine();
    state.write('```');
    state.closeBlock(node);
  }
}
