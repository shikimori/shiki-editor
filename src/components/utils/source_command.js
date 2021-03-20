import insertAtCaret from './insert_at_caret';

export default function sourceCommand(app, type, value) {
  switch (type) {
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

    case 'smiley':
      insertAtCaret(app, '', value);
      break;

    default:
      console.error(`undefined command "${type}"`); // eslint-disable-line no-console
  }
}
