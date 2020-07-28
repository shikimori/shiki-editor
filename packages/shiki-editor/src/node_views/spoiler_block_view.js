import bind from 'bind-decorator';
import DOMView from './dom_view';

export default class SpoilerBlockView extends DOMView {
  constructor(options) {
    super(options);

    this.dom = document.createElement('div');
    this.contentDOM = document.createElement('div');

    this.dom.classList.add('b-spoiler_block');
    if (this.node.attrs.isOpened) {
      this.dom.classList.add('is-opened');
    }

    const button = document.createElement('button');
    button.innerText = this.node.attrs.label;
    button.addEventListener('click', this.toggle);

    const edit = document.createElement('span');
    edit.classList.add('edit');
    edit.addEventListener('click', this.changeLabel);

    this.dom.appendChild(button);
    this.dom.appendChild(edit);
    this.dom.appendChild(this.contentDOM);
  }

  // for some reason this fixes headline editing of closed spoiler
  // https://prosemirror.net/docs/ref/#view.NodeView.update
  update(_node, _decorations) {
    return false;
  }

  @bind
  toggle() {
    const { getPos, node, view, dispatch, tr } = this;
    const attrs = this.mergeAttrs({ isOpened: !node.attrs.isOpened });

    dispatch(
      tr.setNodeMarkup(getPos(), null, attrs)
    );
    view.focus();
  }

  @bind
  changeLabel() {
    const { getPos, node, view, dispatch, tr } = this;

    const label = prompt(
      window.I18n.t('frontend.shiki_editor.prompt.spoiler_label'),
      node.attrs.label
    );
    if (!label) { return; }

    dispatch(
      tr.setNodeMarkup(getPos(), null, this.mergeAttrs({ label }))
    );
    view.focus();
  }
}
