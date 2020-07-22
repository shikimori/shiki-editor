export default function(editor) {
  return editor
    .extensionsManager
    .extensions
    .find(v => v.name === 'shiki_loader');
}
