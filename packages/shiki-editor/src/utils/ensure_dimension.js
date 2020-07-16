export default function(size, defaultDimension) {
  return size === String(parseInt(size)) ? `${size}${defaultDimension}` : size;
}
