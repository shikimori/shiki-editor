import { Plugin, PluginKey } from 'prosemirror-state';
import { bind } from 'shiki-decorators';

import { Extension } from '../base';

import {
  insertUploadPlaceholder,
  replaceUploadPlaceholder,
  removeUploadPlaceholder
} from '../commands';

export default class FileUploader extends Extension {
  get name() {
    return 'file_uploader';
  }

  get defaultOptions() {
    return {
      shikiUploader: null
    };
  }

  attachShikiUploader({ node, progressContainerNode }) {
    this.options.shikiUploader
      .attachTo({ node, progressContainerNode })
      .on('upload:file:added', this._uploadFileAdded)
      .on('upload:file:success', this._uploadFileSuccess)
      .on('upload:file:error', this._uploadFileError);
  }

  get isUploading() {
    return !!(this.shikiUploader?.isUploading);
  }

  get shikiUploader() {
    return this.options.shikiUploader;
  }

  addFiles(files) {
    this.shikiUploader.addFiles(files);
  }

  enable() {
    this.shikiUploader.enable();
  }

  disable() {
    this.shikiUploader.disable();
  }

  @bind
  _uploadFileAdded(_e, uppyFile) {
    insertUploadPlaceholder(
      this.editor,
      { uploadId: uppyFile.id, file: uppyFile.data }
    );
  }

  @bind
  _uploadFileSuccess(_e, { uppyFile, response }) {
    replaceUploadPlaceholder(
      this.editor,
      { uploadId: uppyFile.id, response }
    );
  }

  @bind
  _uploadFileError(_e, { uppyFile }) {
    removeUploadPlaceholder(
      this.editor,
      { uploadId: uppyFile.id }
    );
  }

  get plugins() {
    const extension = this;

    return [
      new Plugin({
        key: new PluginKey(this.name),
        props: {
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
    this.shikiUploader.detach()
      .off('upload:file:added', this._uploadFileAdded)
      .off('upload:file:success', this._uploadFileSuccess)
      .off('upload:file:error', this._uploadFileError);
  }
}
