import insertAtCaret from './insert_at_caret';

export default function sourceCommand(app, type, value) {
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
      insertAtCaret(app, '', value);
      break;

    // case 'image':
    // case 'shiki_link':
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
