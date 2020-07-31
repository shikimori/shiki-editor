export default function ensureDimention(size, defaultDimension) {
  return size === String(parseInt(size)) ? `${size}${defaultDimension}` : size;
}
