import { Plugin, PluginKey } from 'prosemirror-state';
import { flash } from 'shiki-utils';

export default function preventHugePaste(MAXIMUM_CONTENT_SIZE) {
  return new Plugin({
    key: new PluginKey('prevent_huge_paste'),
    props: {
      handlePaste(view, e, slice) {
        if (slice.size > MAXIMUM_CONTENT_SIZE) {
          flash.error(window.I18n.t('frontend.shiki_editor.huge_content_pasted'));
          return true;
        }
      }
    }
  });
}
