export default function fixUrl(url, baseUrl) {
  if ((!baseUrl && url[0] === '/') || url.startsWith('http')) {
    return url;
  }
  if (baseUrl && url[0] === '/' && url[1] !== '/') {
    return `${baseUrl}${url}`;
  }

  return `//${url}`;
}
