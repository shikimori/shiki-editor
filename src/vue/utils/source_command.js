import {
  insertAtCaret,
  insertAtLineStart,
  wrapLine,
  insertPlaceholder,
  replacePlaceholder
} from './insert_at_textarea';

export default function sourceCommand(app, type, payload) {
  switch (type) {
    // inline commands
    case 'bold':
      insertAtCaret(app, '[b]', '[/b]', true);
      break;

    case 'italic':
      insertAtCaret(app, '[i]', '[/i]', true);
      break;

    case 'underline':
      insertAtCaret(app, '[u]', '[/u]', true);
      break;

    case 'strike':
      insertAtCaret(app, '[s]', '[/s]', true);
      break;

    case 'spoiler_inline':
      insertAtCaret(app, '||', '||', true);
      break;

    case 'code_inline':
      insertAtCaret(app, '`', '`', true);
      break;

    case 'color_inline':
      insertAtCaret(app, `[color=${payload.color}]`, '[/color]', true);
      break;

    case 'link':
      payload = prompt( // eslint-disable-line no-param-reassign
        window.I18n.t('frontend.shiki_editor.prompt.link_url')
      )?.trim();
      if (payload == null) {
        return;
      }

      insertAtCaret(
        app,
        `[url=${payload}]`,
        '[/url]',
        true,
        payload.replace(/^https?:\/\/|\/.*/g, '')
      );
      break;

    // item commands
    case 'smiley':
      insertAtCaret(app, '', payload);
      break;

    case 'image':
      payload = prompt( // eslint-disable-line no-param-reassign
        window.I18n.t('frontend.shiki_editor.prompt.image_url')
      )?.trim();
      if (payload == null) {
        return;
      }

      insertAtCaret(app, '', `[img]${payload}[/img]`);
      break;

    case 'shiki_link':
      insertAtCaret(
        app,
        `[${payload.type}=${payload.id}]`,
        `[/${payload.type}]`,
        true,
        payload.text
      );
      break;

    case 'upload:added':
      insertPlaceholder(app, uploadPlaceholder(payload.uploadId));
      break;

    case 'upload:success':
      replacePlaceholder(
        app,
        uploadPlaceholder(payload.uploadId),
        payload.response.bbcode
      );
      break;

    case 'upload:error':
      replacePlaceholder(app, uploadPlaceholder(payload.uploadId), '');
      break;

    // block commands
    case 'blockquote':
      insertAtLineStart(app, '> ');
      break;

    case 'spoiler_block':
      wrapLine(app, '[spoiler_block]', '[/spoiler_block]');
      break;

    case 'color_block':
      wrapLine(app, `[color=${payload.color}]`, '[/color]');
      break;

    case 'code_block':
      wrapLine(app, '```', '```');
      break;

    case 'bullet_list':
      insertAtLineStart(app, '- ');
      break;

    default:
      console.error(`undefined command "${type}"`); // eslint-disable-line no-console
  }
}

function uploadPlaceholder(uploadId) {
  return `[upload #${uploadId}...]`;
}
