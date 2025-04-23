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
export const updateModelVars = ({ color }: { color: ColorObject }): void => {
  // Iterate over color properties, excluding functions (like set and toString)
  Object.keys(color).forEach((part) => {
    if (color[part] !== undefined && typeof color[part] !== "function") {
      setRoot(part, String(color[part]));
    }
  });
};

/**
 * Sets the root CSS color variable to the current color's RGB value.
 * @param color - The color object to set.
 */
export const setRootColor = (color: ColorObject): void => {
  setRoot("color", color.rgb);
};
