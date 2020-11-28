export default function fixUrl(url, origin) {
  if ((!origin && url[0] === '/') || url.startsWith('http')) {
    return url;
  }
  if (origin && url[0] === '/' && url[1] !== '/') {
    return `${origin}${url}`;
  }

  return `//${url}`;
}
