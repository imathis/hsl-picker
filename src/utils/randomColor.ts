/**
 * Generates a random number or string within a range.
 * @param min - Minimum value.
 * @param max - Maximum value.
 * @param unit - Optional unit to append (e.g., "%").
 * @returns A random number or string with the unit appended.
 */
const getRandom = (
  min: number,
  max: number,
  unit?: string,
): string | number => {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return unit ? `${num}${unit}` : num;
};

/**
 * Generates a random HSL color string.
 * @returns A random HSL color string.
 */
export const randomHsl = () => `hsl(${getRandom(0, 360)} 100% 50%)`;
