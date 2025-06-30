import { ColorObject } from "../types";
import { generateHsvGradient } from "./gradientUtils";

/**
 * Sets a CSS custom property on the root element.
 * @param prop - The property name (prefixed with "--picker-").
 * @param value - The value to set.
 */
export const setRoot = (prop: string, value: string): void => {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.style.setProperty(`--picker-${prop}`, value);
  }
};

/**
 * Gets the value of a CSS custom property from the root element.
 * @param prop - The property name (prefixed with "--picker-").
 * @returns The property value.
 */
export const getRoot = (prop: string): string => {
  if (typeof document !== 'undefined' && document.documentElement) {
    return document.documentElement.style.getPropertyValue(`--picker-${prop}`);
  }
  return '';
};

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
 * Updates HSV gradient CSS variables with the current color.
 * @param color - The ColorObject to apply.
 */
export const updateHsvGradients = (color: ColorObject) => {
  // Generate proper HSV gradients using the current HSV values
  const hsvHue = generateHsvGradient(color.hue, color.hsvSaturation, color.value, 'hue', 36);
  const hsvSaturation = generateHsvGradient(color.hue, color.hsvSaturation, color.value, 'saturation', 10);
  const hsvValue = generateHsvGradient(color.hue, color.hsvSaturation, color.value, 'value', 10);
  
  // Set HSV-specific gradient CSS variables
  setRoot("hsv-hue-gradient", hsvHue);
  setRoot("hsv-saturation-gradient", hsvSaturation);
  setRoot("hsv-value-gradient", hsvValue);
};

/**
 * Updates CSS variables, root color, URL, and HSV gradients with the current color.
 * @param color - The ColorObject to apply.
 */
export const updateUiColor = (color: ColorObject) => {
  updateModelVars(color);
  setRoot("color", color.rgb);
  updateUrl(color.hex);
  
  // Only generate HSV gradients if we're in a browser environment and DOM is ready
  if (typeof window !== 'undefined' && document.readyState !== 'loading') {
    updateHsvGradients(color);
  }
};
