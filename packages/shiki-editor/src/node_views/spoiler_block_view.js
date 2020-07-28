import bind from 'bind-decorator';
import DOMView from './dom_view';

export default class SpoilerBlockView extends DOMView {
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

    this.sync();

    this.dom.appendChild(this.button);
    this.dom.appendChild(edit);
    this.dom.appendChild(this.contentDOM);
  }

  // for some reason this fixes headline editing of closed spoiler
  // https://prosemirror.net/docs/ref/#view.NodeView.update
  // update(_node, _decorations) {
    // return false;
  // }

  @bind
  toggle() {
    this.updateAttrs({ isOpened: !this.node.attrs.isOpened });
    this.sync();
    this.view.focus();
  }

  update(node, decorations) {
    if (!super.update(node, decorations)) { return false; }
    this.sync();
    return true;
  }

  sync() {
    this.dom.classList.toggle('is-opened', this.node.attrs.isOpened);
    this.button.innerText = this.node.attrs.label;
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
