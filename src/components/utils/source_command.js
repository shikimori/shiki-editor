import {
  insertAtCaret,
  insertAtLineStart,
  wrapLine
} from './insert_at_textarea';

export default function sourceCommand(app, type, data) {
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

    case 'link':
      data = prompt( // eslint-disable-line no-param-reassign
        window.I18n.t('frontend.shiki_editor.prompt.link_url')
      )?.trim();
      if (data == null) { return; }

      insertAtCaret(
        app,
        `[url=${data}]`,
        '[/url]',
        true,
        data.replace(/^https?:\/\/|\/.*/g, '')
      );
      break;

    // item commands
    case 'smiley':
      insertAtCaret(app, '', data);
      break;

    case 'image':
      data = prompt( // eslint-disable-line no-param-reassign
        window.I18n.t('frontend.shiki_editor.prompt.image_url')
      )?.trim();
      if (data == null) { return; }

      insertAtCaret(app, '', `[img]${data}[/img]`);
      break;

    case 'shiki_link':
      insertAtCaret(
        app,
        `[${data.type}=${data.id}]`,
        `[/${data.type}]`,
        true,
        data.text
      );
      break;

    // case 'upload':

    // block commands
    case 'blockquote':
      insertAtLineStart(app, '> ');
      break;

    case 'spoiler_block':
      wrapLine(app, '[spoiler_block]', '[/spoiler_block]');
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
