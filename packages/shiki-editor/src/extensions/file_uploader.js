import { Plugin, PluginKey } from 'prosemirror-state';
import { Extension } from '../base';
import { bind } from 'decko';

import {
  insertUploadPlaceholder,
  replaceUploadPlaceholder,
  removeUploadPlaceholder
} from '../commands';

export default class FileUploader extends Extension {
  fileUploader = null;

  get name() {
    return 'file_uploader';
  }

  get defaultOptions() {
    return {
      progressContainerNode: null,
      locale: null,
      uploadEndpoint: null,
      uploadHeaders: null
    };
  }

  async init() {
    console.log(process.env.VUE_APP_USER);
    const { default: ShikiUploader } = await import(
      process.env.VUE_APP_USER === 'morr' ?
        '../../../../packages/shiki-uploader' :
        'shiki-uploader'
    );

    this.fileUploader = this.buildFileUploader(ShikiUploader);
    this.fileUploader
      .on('upload:file:added', (_e, uppyFile) =>
        insertUploadPlaceholder(
          this.editor,
          { uploadId: uppyFile.id, file: uppyFile.data }
        )
      )
      .on('upload:file:success', (_e, { uppyFile, response }) =>
        replaceUploadPlaceholder(
          this.editor,
          { uploadId: uppyFile.id, response }
        )
      )
      .on('upload:file:error', (_e, { uppyFile }) =>
        removeUploadPlaceholder(
          this.editor,
          { uploadId: uppyFile.id }
        )
      );
  }

  get isUploading() {
    return !!(this.fileUploader?.isUploading);
  }

  addFiles(files) {
    this.fileUploader.addFiles(files);
  }

  enable() {
    this.fileUploader.enable();
  }

  disable() {
    this.fileUploader.disable();
  }

  buildFileUploader(ShikiFileUploader) {
    return new ShikiFileUploader({
      node: this.editor.view.dom,
      progressContainerNode: this.options.progressContainerNode,
      locale: this.options.locale,
      xhrEndpoint: this.options.uploadEndpoint,
      xhrHeaders: this.options.uploadHeaders,
      maxNumberOfFiles: 10
    });
  }

  get plugins() {
    const extension = this;

    return [
      new Plugin({
        key: new PluginKey(this.name),
        props: {
          @bind
          handlePaste(_view, event, _slice) {
            if (event.clipboardData.files.length) {
              event.preventDefault();
              event.stopImmediatePropagation();

              extension.addFiles(event.clipboardData.files);
              return true;
            }

            const atLeastOneFileTransfered = Array
              .from(event.clipboardData.items)
              .some(item => item.kind === 'file');

            if (atLeastOneFileTransfered) {
              const files = [];

              event.clipboardData.items.forEach(item => {
                if (item.kind !== 'file') { return; }
                const file = item.getAsFile();
                if (file) {
                  files.push(file);
                }
              });

              if (files.length) {
                extension.addFiles(files);
              }
              return true;
            }
          }
        }
      })
    ];
  }

  destroy() {
    this.fileUploader.destroy();
  }
}
