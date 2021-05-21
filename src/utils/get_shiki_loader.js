export default function(editor) {
  return editor
    .extensionManager
    .extensions
    .find(v => v.name === 'shiki_loader');
}
