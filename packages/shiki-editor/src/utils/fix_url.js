export default function fixUrl(url) {
  if (url[0] === '/' || url.startsWith('http')) {
    return url;
  }

  return `//${url}`;
}
