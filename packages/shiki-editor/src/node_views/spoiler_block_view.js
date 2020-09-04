import { bind } from 'shiki-decorators';
import { DOMSerializer } from 'prosemirror-model';

import DOMView from './dom_view';

const ANY_BBCODE_REGEXP = /\[\w+/;

export default class SpoilerBlockView extends DOMView {
  priorLabel = null

  constructor(options) {
    super(options);

    this.dom = document.createElement('div');
    this.contentDOM = document.createElement('div');

    this.dom.classList.add('b-spoiler_block');
    this.button = document.createElement('button');
    this.button.addEventListener('click', this.toggle);

    const edit = document.createElement('span');
    edit.classList.add('edit');
    edit.addEventListener('click', this.changeLabel);

    this.syncState();

    this.dom.appendChild(this.button);
    this.dom.appendChild(edit);
    this.dom.appendChild(this.contentDOM);
  }

  @bind
  toggle(e) {
    e.preventDefault();

    this.updateAttrs({ isOpened: !this.node.attrs.isOpened });
    this.syncState();
    this.view.focus();
  }

  syncState() {
    this.dom.classList.toggle('is-opened', this.node.attrs.isOpened);

    if (this.node.attrs.label === this.priorLabel) { return; }
    this.priorLabel = this.node.attrs.label;

    if (this.node.attrs.label.match(ANY_BBCODE_REGEXP)) {
      const domSerializer = DOMSerializer.fromSchema(this.editor.schema);
      const nodes = this.editor.markdownParser.parse(this.node.attrs.label);
      const content = nodes.content?.content?.[0]?.type?.name === 'paragraph' ?
        nodes.content.content[0].content :
        nodes.content;

      this.button.innerHTML = '';
      this.button.appendChild(domSerializer.serializeFragment(content));
    } else {
      this.button.innerText = this.node.attrs.label;
    }
  }

  @bind
  changeLabel() {
    const label = prompt(
      window.I18n.t('frontend.shiki_editor.prompt.spoiler_label'),
      this.node.attrs.label
    );
    if (!label) { return; }

    this.updateAttrs({ label });
    this.view.focus();
  }
}
