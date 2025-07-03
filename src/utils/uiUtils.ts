import { ColorObject } from "../types";
import { generateHsvGradient, generateOklchGradient } from "./gradientUtils";

/**
 * Sets a CSS custom property on the root element.
 * @param prop - The property name (prefixed with "--picker-").
 * @param value - The value to set.
 */
export const setRoot = (prop: string, value: string): void => {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.style.setProperty(`--picker-${prop}`, value);
  }
};

/**
 * Gets the value of a CSS custom property from the root element.
 * @param prop - The property name (prefixed with "--picker-").
 * @returns The property value.
 */
export const getRoot = (prop: string): string => {
  if (typeof document !== "undefined" && document.documentElement) {
    return document.documentElement.style.getPropertyValue(`--picker-${prop}`);
  }
  return "";
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
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Debounced URL update function - uses hex for sRGB models, OKLCH for wide gamut
export const updateUrl = debounce((colorObject: ColorObject, useOklch: boolean = false) => {
  let url: string;
  if (useOklch) {
    // Format: #L,C,H,A (e.g., #0.7,0.1,154,1)
    url = `#${colorObject.oklchLightness.toFixed(3)},${colorObject.oklchChroma.toFixed(3)},${colorObject.oklchHue.toFixed(3)},${colorObject.alpha.toFixed(3)}`;
  } else {
    // Use hex format for sRGB colors
    url = colorObject.hex;
  }
  window.history.replaceState({}, "", url);
}, 100); // 100ms delay

/**
 * Updates HSV gradient CSS variables with the current color.
 * @param color - The ColorObject to apply.
 */
export const updateHsvGradients = (color: ColorObject) => {
  // Generate proper HSV gradients using the current HSV values
  const hsvHue = generateHsvGradient(
    color.hue,
    color.hsvSaturation,
    color.value,
    "hue",
    36,
  );
  const hsvSaturation = generateHsvGradient(
    color.hue,
    color.hsvSaturation,
    color.value,
    "saturation",
    10,
  );
  const hsvValue = generateHsvGradient(
    color.hue,
    color.hsvSaturation,
    color.value,
    "value",
    10,
  );

  // Set HSV-specific gradient CSS variables
  setRoot("hsv-hue-gradient", hsvHue);
  setRoot("hsv-saturation-gradient", hsvSaturation);
  setRoot("hsv-value-gradient", hsvValue);
};

/**
 * Updates OKLCH gradient CSS variables with the current color, taking gamut limitations into account.
 * @param color - The ColorObject to apply.
 * @param showP3 - Whether to use P3 gamut (true) or sRGB gamut (false).
 * @param gamutGaps - Whether to show hard cutoffs for out-of-gamut colors (true) or smooth gradients (false).
 */
export const updateOklchGradients = (
  color: ColorObject,
  showP3: boolean,
  gamutGaps: boolean,
) => {
  // Generate gamut-aware OKLCH gradients using current OKLCH values with higher resolution
  const oklchLightness = generateOklchGradient(
    color.oklchLightness,
    color.oklchChroma,
    color.oklchHue,
    "lightness",
    100, // Increased from 20 to 100 for better accuracy
    showP3,
    gamutGaps,
  );
  const oklchChroma = generateOklchGradient(
    color.oklchLightness,
    color.oklchChroma,
    color.oklchHue,
    "chroma",
    100, // Increased from 20 to 100 for better accuracy
    showP3,
    gamutGaps,
  );
  const oklchHue = generateOklchGradient(
    color.oklchLightness,
    color.oklchChroma,
    color.oklchHue,
    "hue",
    360, // Increased from 72 to 360 for 1-degree precision
    showP3,
    gamutGaps,
  );

  // Set OKLCH-specific gradient CSS variables
  setRoot("oklch-lightness-gradient", oklchLightness);
  setRoot("oklch-chroma-gradient", oklchChroma);
  setRoot("oklch-hue-gradient", oklchHue);
};

/**
 * Updates CSS variables, root color, URL, HSV gradients, and OKLCH gradients with the current color.
 * @param color - The ColorObject to apply.
 * @param showP3 - Whether to use P3 gamut (true) or sRGB gamut (false).
 * @param gamutGaps - Whether to show hard cutoffs for out-of-gamut colors (true) or smooth gradients (false).
 */
export const updateUiColor = (
  color: ColorObject,
  showP3: boolean,
  gamutGaps: boolean,
  activeModel?: string,
) => {
  updateModelVars(color);
  setRoot("color", color.rgb);
  
  // Use OKLCH URL format if actively adjusting OKLCH, otherwise use hex
  const useOklch = activeModel === 'oklch' || color.model === 'oklch';
  updateUrl(color, useOklch);

  // Only generate gradients if we're in a browser environment and DOM is ready
  if (typeof window !== "undefined" && document.readyState !== "loading") {
    updateHsvGradients(color);
    updateOklchGradients(color, showP3, gamutGaps);
  }
};
