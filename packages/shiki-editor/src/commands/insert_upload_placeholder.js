import { uploadPlaceholder } from '../plugins';

export default function(editor, { uploadId, file }) {
  const { state } = editor;
  const { dispatch } = editor.view;
  const tr = state.tr;

  if (!tr.selection.empty) tr.deleteSelection();

  tr.setMeta(uploadPlaceholder, {
    add: {
      id: uploadId,
      file,
      pos: tr.selection.from
    }
  });
  dispatch(tr);
}
