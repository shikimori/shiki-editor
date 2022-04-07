/**
 * Convert RGB to Hex
 * @param r
 * @param {string|number} g
 * @param {string|number} b
 * @returns {string} Hex string
 * @constructor
 */
export default function RGBToHex(r, g, b) {
  let red = parseInt(`${r}`, 10).toString(16);
  let green = parseInt(`${g}`, 10).toString(16);
  let blue = parseInt(`${b}`, 10).toString(16);

  if (red.length === 1) {
    red = '0' + red;
  }

  if (green.length === 1) {
    green = '0' + green;
  }

  if (blue.length === 1) {
    blue = '0' + blue;
  }

  return '#' + red + green + blue;
}
