/* eslint no-param-reassign:0  */
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export default new Plugin({
  key: new PluginKey('upload_placeholder'),
  state: {
    init() { return DecorationSet.empty; },
    apply(tr, set) {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc);
      // See if the transaction adds or removes any placeholders
      const action = tr.getMeta(this);
      if (action && action.add) {
        const widget = createPlaceholder(action.add.file);

        const deco = Decoration.widget(
          action.add.pos,
          widget,
          { id: action.add.id }
        );
        set = set.add(tr.doc, [deco]);
      } else if (action && action.remove) {
        set = set.remove(
          set.find(null, null, spec => spec.id == action.remove.id)
        );
      }
      return set;
    }
  },
  props: {
    decorations(state) { return this.getState(state); }
  }
});

function createPlaceholder(file) {
  const node = document.createElement('div');

  node.classList.add('b-image');
  node.classList.add('b-ajax');
  node.classList.add('is-uploading');
  node.classList.add('no-zoom');

  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const img = document.createElement('img');
    img.src = reader.result;
    node.append(img);

    node.classList.remove('is-uploading');
    node.classList.add('unprocessed');
  });
  reader.readAsDataURL(file);

  return node;
}
