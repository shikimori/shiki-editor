export default function fixChromeDocEvent(e) {
  // Makes it possible to drag files from chrome's download bar
  // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
  // Try is required to prevent bug in Internet Explorer 11 (SCRIPT65535 exception)
  let efct;
  try { efct = e.dataTransfer.effectAllowed; } catch (_error) {} // eslint-disable-line
  e.dataTransfer.dropEffect = efct === 'move' || efct === 'linkMove' ? 'move' : 'copy';
}
