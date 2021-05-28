import { uploadPlaceholder } from '../plugins';
import { findPlaceholder } from '../utils';

export default function replaceUploadPlaceholder(editor, { uploadId, response }) {
  const { state } = editor;
  const { dispatch } = editor.view;
  const pos = findPlaceholder(state, uploadId);
  const url = editor.options.shikiRequest.origin + response.url;

  const attrs = { id: response.id, src: url };

  if (pos != null) {
    dispatch(
      state.tr
        .replaceWith(pos, pos, editor.schema.nodes.image.create(attrs))
        .setMeta(uploadPlaceholder, { remove: { id: uploadId } })
    );
  } else {
    editor.commands.image(attrs);
  }
}
