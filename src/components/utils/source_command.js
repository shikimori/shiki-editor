import insertAtCaret from './insert_at_caret';

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

    // case 'link':
    // item commands

    case 'smiley':
      insertAtCaret(app, data);
      break;

    case 'image':
      data = prompt(window.I18n.t('frontend.shiki_editor.prompt.image_url')); // eslint-disable-line no-param-reassign
      if (data == null) { return; }

      insertAtCaret(app, `[img]${data}[/img]`);
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

    // case 'blockquote':
    // case 'spoiler_block':
    // case 'code_block':
    // case 'bullet_list':

    default:
      console.error(`undefined command "${type}"`); // eslint-disable-line no-console
  }
}
