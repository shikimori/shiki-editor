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
    this.trigger = document.createElement('span');
    this.trigger.addEventListener('click', this.toggle);
    this.trigger.addEventListener('keypress', this.triggerKeypress);
    this.trigger.setAttribute('tabindex', 0);

    const edit = document.createElement('i');
    edit.classList.add('edit');
    edit.addEventListener('click', this.changeLabel);
    edit.addEventListener('keypress', this.editKeypress);
    edit.setAttribute('tabindex', 0);

    const separator = document.createElement('span');
    separator.classList.add('separator');

    this.syncState();

    this.trigger.appendChild(separator);
    this.trigger.appendChild(edit);

    this.dom.appendChild(this.trigger);
    this.dom.appendChild(this.contentDOM);
  }

  syncState() {
    this.dom.classList.toggle('is-opened', this.node.attrs.isOpened);
    this.dom.classList.toggle('is-fullwidth', this.node.attrs.isFullwidth);

    if (this.node.attrs.label === this.priorLabel) { return; }
    this.priorLabel = this.node.attrs.label;

    if (this.node.attrs.label.match(ANY_BBCODE_REGEXP)) {
      const domSerializer = DOMSerializer.fromSchema(this.editor.schema);
      const nodes = this.editor.markdownParser.parse(this.node.attrs.label);
      const content = nodes.content?.content?.[0]?.type?.name === 'paragraph' ?
        nodes.content.content[0].content :
        nodes.content;

      this.trigger.innerHTML = '';
      this.trigger.appendChild(domSerializer.serializeFragment(content));
    } else {
      this.trigger.innerText = this.node.attrs.label;
    }
  }

  @bind
  toggle(e) {
    e.preventDefault();

    this.updateAttrs({ isOpened: !this.node.attrs.isOpened });
    this.syncState();
    this.view.focus();
  }

  @bind
  changeLabel(e) {
    e.stopImmediatePropagation();

    const label = prompt(
      window.I18n.t('frontend.shiki_editor.prompt.spoiler_label'),
      this.node.attrs.label
    );
    if (!label) { return; }

    this.updateAttrs({ label });
    this.view.focus();
  }

  @bind
  editKeypress(e) {
    switch (e.keyCode) {
      case 32: // space
      case 13: // enter
        this.changeLabel();
    }
  }

  @bind
  triggerKeypress(e) {
    switch (e.keyCode) {
      case 32: // space
      case 13: // enter
        this.toggle(e);
    }
  }
}
