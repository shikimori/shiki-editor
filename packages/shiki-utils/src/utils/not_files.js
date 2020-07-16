export default function notFiles(e) {
  if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.length) {
    for (let i = 0; i < e.dataTransfer.types.length; i += 1) {
      if (e.dataTransfer.types[i].toLowerCase() === 'files') {
        return false;
      }
    }
  }
  return true;
}
