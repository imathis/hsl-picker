import { ColorObject } from "../types";

/**
 * Sets a CSS custom property on the root element.
 * @param prop - The property name (prefixed with "--picker-").
 * @param value - The value to set.
 */
export const setRoot = (prop: string, value: string): void =>
  document.documentElement.style.setProperty(`--picker-${prop}`, value);

/**
 * Gets the value of a CSS custom property from the root element.
 * @param prop - The property name (prefixed with "--picker-").
 * @returns The property value.
 */
export const getRoot = (prop: string): string =>
  document.documentElement.style.getPropertyValue(`--picker-${prop}`);

/**
 * Updates CSS custom properties with the current color values.
 * @param color - The color object containing properties to set.
 */
const updateModelVars = (color: ColorObject): void => {
  // Iterate over color properties, excluding functions (like set and toString)
  Object.keys(color).forEach((part) => {
    if (color[part] !== undefined && typeof color[part] !== "function") {
      setRoot(part, String(color[part]));
    }
  });
};

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Debounced URL update function
export const updateUrl = debounce((colorHex: string) => {
  window.history.replaceState({}, "", colorHex);
}, 100); // 100ms delay

/**
 * Updates CSS variables, root color, and URL with the current color.
 * @param color - The ColorObject to apply.
 */
export const updateUiColor = (color: ColorObject) => {
  updateModelVars(color);
  setRoot("color", color.rgb);
  updateUrl(color.hex);
};
