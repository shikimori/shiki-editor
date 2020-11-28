import { uploadPlaceholder } from '../plugins';
import { findPlaceholder } from '../utils';

export default function(editor, { uploadId }) {
  const { state } = editor;
  const { dispatch } = editor.view;

  const pos = findPlaceholder(state, uploadId);

  if (pos == null) { return; }
  dispatch(
    state.tr.setMeta(uploadPlaceholder, { remove: { id: uploadId } })
  );
}
