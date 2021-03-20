import insertAtCaret from './insert_at_caret';

export default function sourceCommand(app, type, value) {
  switch (type) {
    case 'bold':
      insertAtCaret(app, '[b]', '[/b]');
      break;

    case 'italic':
      insertAtCaret(app, '[i]', '[/i]');
      break;

    case 'underline':
      insertAtCaret(app, '[u]', '[/u]');
      break;

    case 'strike':
      insertAtCaret(app, '[s]', '[/s]');
      break;

    case 'smiley':
      insertAtCaret(app, '', value);
      break;

    default:
      console.error(`undefined command "${type}"`); // eslint-disable-line no-console
  }
}
