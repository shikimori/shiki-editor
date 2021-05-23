import { bind } from 'shiki-decorators';
import { DOMSerializer } from 'prosemirror-model';

import NodeView from '../node_view';
import { contentToNodes } from '../utils';

const ANY_BBCODE_REGEXP = /\[\w+/;

export default class SpoilerBlockView extends NodeView {
  priorLabel = null

  mount() {
    this.dom = document.createElement('div');
    this.contentDOM = document.createElement('div');

    this.dom.classList.add('b-spoiler_block');
    this.trigger = document.createElement('span');
    this.trigger.addEventListener('click', this.toggle);
    this.trigger.addEventListener('keypress', this.triggerKeypress);
    this.trigger.setAttribute('tabindex', 0);

    this.trigger_edit = document.createElement('i');
    this.trigger_edit.classList.add('edit');
    this.trigger_edit.addEventListener('click', this.editClick);
    this.trigger_edit.addEventListener('keypress', this.editKeypress);
    this.trigger_edit.setAttribute('tabindex', 0);

    this.trigger_separator = document.createElement('span');
    this.trigger_separator.classList.add('separator');

    this.trigger_expand = document.createElement('i');
    this.trigger_expand.classList.add('expand');
    this.trigger_expand.addEventListener('click', this.expandClick);
    this.trigger_expand.addEventListener('keypress', this.expandKeypress);
    this.trigger_expand.setAttribute('tabindex', 0);

    this.trigger_center = document.createElement('i');
    this.trigger_center.classList.add('center');
    this.trigger_center.addEventListener('click', this.centerClick);
    this.trigger_center.addEventListener('keypress', this.centerKeypress);
    this.trigger_center.setAttribute('tabindex', 0);

    this.syncState();

    this.dom.appendChild(this.trigger);
    this.dom.appendChild(this.contentDOM);
  }

  syncState() {
    this.dom.classList.toggle('is-opened', this.node.attrs.isOpened);
    this.dom.classList.toggle('is-fullwidth', this.node.attrs.isFullwidth);
    this.dom.classList.toggle('is-centered', this.node.attrs.isCentered);

    if (this.node.attrs.label === this.priorLabel) { return; }
    this.priorLabel = this.node.attrs.label;

    if (this.node.attrs.label.match(ANY_BBCODE_REGEXP)) {
      const domSerializer = DOMSerializer.fromSchema(this.editor.schema);
      // const nodes = this.editor.markdownParser.parse(this.node.attrs.label);
      // const content = nodes.content?.content?.[0]?.type?.name === 'paragraph' ?
      //   nodes.content.content[0].content :
      //   nodes.content;

      const content = contentToNodes(this.editor, this.node.attrs.label);

      this.trigger.innerHTML = '';
      this.trigger.appendChild(domSerializer.serializeFragment(content));
    } else {
      this.trigger.innerText = this.node.attrs.label;
    }

    this.trigger.appendChild(this.trigger_separator);
    this.trigger.appendChild(this.trigger_expand);
    this.trigger.appendChild(this.trigger_center);
    this.trigger.appendChild(this.trigger_edit);
  }

  @bind
  toggle(e) {
    e.preventDefault();

    this.updateAttributes({ isOpened: !this.node.attrs.isOpened });
    this.syncState();
    this.view.focus();
  }

  @bind
  editClick(e) {
    e.stopImmediatePropagation();

    const label = prompt(
      window.I18n.t('frontend.shiki_editor.prompt.spoiler_label'),
      this.node.attrs.label
    );
    if (!label) { return; }

    this.updateAttributes({ label });
    this.view.focus();
  }

  @bind
  editKeypress(e) {
    switch (e.keyCode) {
      case 32: // space
      case 13: // enter
        e.preventDefault();
        this.editClick(e);
    }
  }

  @bind
  expandClick(e) {
    e.stopImmediatePropagation();

    this.updateAttributes({ isFullwidth: !this.node.attrs.isFullwidth });
  }

  @bind
  expandKeypress(e) {
    switch (e.keyCode) {
      case 32: // space
      case 13: // enter
        e.preventDefault();
        this.expandClick(e);
    }
  }

  @bind
  centerClick(e) {
    e.stopImmediatePropagation();

    this.updateAttributes({ isCentered: !this.node.attrs.isCentered });
  }

  @bind
  centerKeypress(e) {
    switch (e.keyCode) {
      case 32: // space
      case 13: // enter
        e.preventDefault();
        this.centerClick(e);
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
