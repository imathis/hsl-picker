import { Colord, colord, extend } from "colord";
import hwbPlugin from "colord/plugins/hwb";
import namesPlugin from "colord/plugins/names";
import { ColorModel, ColorParts } from "../types";

// Extend colord with HWB and names plugins (already used in colorConversion.ts)
extend([hwbPlugin, namesPlugin]);

/**
 * Defines the components of each color model.
 */
export const colorModels: ColorModel = {
  hsl: ["hue", "saturation", "luminosity", "alpha"],
  hsv: ["hue", "hsvSaturation", "value", "alpha"],
  hwb: ["hue", "whiteness", "blackness", "alpha"],
  rgb: ["red", "green", "blue", "alpha"],
};

/**
 * A list of all unique color parts across all models.
 */
export const allColorParts: string[] = Object.values(colorModels)
  .flat()
  .reduce((acc: string[], item: string) => {
    return acc.indexOf(item) < 0 ? [...acc, item] : acc;
  }, []);

/**
 * Creates a regular expression to match a color string format.
 * @param type - The color model type ("hex", "hsl", "hwb", "rgb").
 * @returns A RegExp to match the color format.
 */
const colorPattern = (type: keyof ColorModel | "hex"): RegExp => {
  if (type === "hex") {
    // Matches 3, 4, 6, and 8 character hex codes (4, 8 have alpha channels)
    return new RegExp(
      "^#(\\b(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\\b)$",
    );
  }
  const num = "([\\d.]+)"; // number characters with decimals
  const percent = "([\\d.]+%)"; // number characters with decimals
  const sep = "\\s*(?:,|\\s)\\s*"; // non number characters
  const alph = "\\d\\.{0,1}\\d*"; // number decimal number
  const alphsep = "\\s*(?:,|/)\\s*";
  const main = {
    rgb: [num, num, num],
    hsl: [num, percent, percent],
    hsv: [num, percent, percent],
    hwb: [num, percent, percent],
  }[type];
  return new RegExp(
    `^${type}a?\\(${main.join(sep)}(?:${alphsep}(${alph}))?\\)$`,
  );
};

/**
 * Regular expressions for validating color strings in different models.
 */
export const colorPatterns: { [key in keyof ColorModel | "hex"]: RegExp } = {
  hsl: colorPattern("hsl"),
  hsv: colorPattern("hsv"),
  hwb: colorPattern("hwb"),
  rgb: colorPattern("rgb"),
  hex: colorPattern("hex"),
};

/**
 * Parses an HSL string directly to preserve raw input values for a color picker.
 * @param color - The HSL color string to parse (e.g., "hsl(150, 100%, 0%)").
 * @returns An array of numbers [hue, saturation, luminosity, alpha], or null if invalid.
 */
const parseHslString = (color: string): number[] | null => {
  const hslPattern = colorPattern("hsl");
  const match = color.match(hslPattern);
  if (!match) {
    return null;
  }
  const [, hue, saturation, luminosity, alpha] = match;
  return [
    Number.parseFloat(hue),
    Number.parseFloat(saturation),
    Number.parseFloat(luminosity),
    alpha !== undefined ? Number.parseFloat(alpha) : 1,
  ];
};

/**
 * Parses an HSV string directly to preserve raw input values for a color picker.
 * @param color - The HSV color string to parse (e.g., "hsv(150, 100%, 50%)").
 * @returns An array of numbers [hue, saturation, value, alpha], or null if invalid.
 */
export const parseHsvString = (color: string): number[] | null => {
  const hsvPattern = colorPattern("hsv");
  const match = color.match(hsvPattern);
  if (!match) {
    return null;
  }
  const [, hue, saturation, value, alpha] = match;
  return [
    Number.parseFloat(hue),
    Number.parseFloat(saturation),
    Number.parseFloat(value),
    alpha !== undefined ? Number.parseFloat(alpha) : 1,
  ];
};

/**
 * Parses an HWB string directly to preserve raw input values for a color picker.
 * @param color - The HWB color string to parse (e.g., "hwb(150, 0%, 100%)").
 * @returns An array of numbers [hue, whiteness, blackness, alpha], or null if invalid.
 */
export const parseHwbString = (color: string): number[] | null => {
  const hwbPattern = colorPattern("hwb");
  const match = color.match(hwbPattern);
  if (!match) {
    return null;
  }
  const [, hue, whiteness, blackness, alpha] = match;
  return [
    Number.parseFloat(hue),
    Number.parseFloat(whiteness),
    Number.parseFloat(blackness),
    alpha !== undefined ? Number.parseFloat(alpha) : 1,
  ];
};

/**
 * Normalizes HWB values to ensure whiteness + blackness does not exceed 100%.
 * @param whiteness - The whiteness percentage.
 * @param blackness - The blackness percentage.
 * @returns A normalized [whiteness, blackness] pair.
 */
export const normalizeHwbValues = (
  whiteness: number,
  blackness: number,
): [number, number] => {
  const total = whiteness + blackness;
  if (total <= 100) {
    return [whiteness, blackness];
  }
  // Normalize by scaling whiteness and blackness proportionally
  const normalizedWhiteness = (whiteness / total) * 100;
  const normalizedBlackness = (blackness / total) * 100;
  return [normalizedWhiteness, normalizedBlackness];
};

/**
 * Determines the color model of a string using colord.
 * @param str - The color string to identify.
 * @returns The color model ("hsl", "hwb", "rgb", or "hex").
 * @throws Error if no matching model is found.
 */
export const colorModel = (str: string): keyof ColorModel | "hex" => {
  // Check HSV first since colord doesn't support it
  if (str.match(/^hsv\(/i)) {
    const hsvValues = parseHsvString(str);
    if (hsvValues) {
      return "hsv";
    }
  }

  const color: Colord = colord(str);
  if (!color.isValid()) {
    throw new Error(
      `Color Error: No matching color model could be found for ${str}`,
    );
  }

  if (/^#[0-9a-f]{3,8}$/i.test(str)) {
    return "hex";
  }
  if (str.match(/^rgba?\(/i)) {
    return "rgb";
  }
  if (str.match(/^hsla?\(/i)) {
    return "hsl";
  }
  if (str.match(/^hwb\(/i)) {
    return "hwb";
  }

  // Default to rgb for named colors and other formats colord supports
  return "rgb";
};

/**
 * Parses a color string into an array of numbers using colord, with special handling for HSL and HWB to preserve raw input.
 * @param color - The color string to parse.
 * @param model - The color model to parse against.
 * @returns An array of numbers representing the color components, or null if invalid.
 */
export const colorArray = (
  color: string,
  model: keyof ColorModel = color.slice(0, 3) as keyof ColorModel,
): number[] | null => {
  // Special handling for HSV to preserve raw input values for color picker
  if (model === "hsv" && color.match(/^hsv\(/i)) {
    return parseHsvString(color);
  }

  // For non-HSV colors, validate with colord
  const colordColor: Colord = colord(color);
  if (!colordColor.isValid()) {
    return null;
  }

  // Special handling for HSL to preserve raw input values for color picker
  if (model === "hsl" && color.match(/^hsla?\(/i)) {
    return parseHslString(color);
  }

  // Special handling for HSL to preserve raw input values for color picker
  if (model === "hsl" && color.match(/^hsla?\(/i)) {
    return parseHslString(color);
  }

  // Special handling for HSV to preserve raw input values for color picker
  if (model === "hsv" && color.match(/^hsv\(/i)) {
    return parseHsvString(color);
  }

  // Special handling for HWB to preserve raw input values for color picker
  if (model === "hwb" && color.match(/^hwb\(/i)) {
    const rawValues = parseHwbString(color);
    if (!rawValues) {
      return null;
    }
    return rawValues;
  }

  // Special handling for HWB to preserve raw input values for color picker
  if (model === "hwb" && color.match(/^hwb\(/i)) {
    const rawValues = parseHwbString(color);
    if (!rawValues) {
      return null;
    }
    return rawValues;
  }

  switch (model) {
    case "rgb": {
      const { r, g, b, a } = colordColor.toRgb();
      return [r, g, b, a];
    }
    case "hsl": {
      const { h, s, l, a } = colordColor.toHsl();
      return [h, s, l, a];
    }
    case "hsv": {
      // HSV is handled manually since colord doesn't parse HSV strings
      return parseHsvString(color) || [0, 0, 0, 1];
    }
    case "hwb": {
      const { h, w, b, a } = colordColor.toHwb();
      return [h, w, b, a];
    }
    default:
      return null;
  }
};

/**
 * Extracts color components from a color string using colord.
 * @param color - The color string to parse.
 * @param model - The color model to parse against.
 * @returns A ColorParts object with the parsed components.
 */
export const colorParts = (
  color: string,
  model: keyof ColorModel | "hex" = color.slice(0, 3) as keyof ColorModel,
): ColorParts => {
  if (model === "hex" || color.startsWith("#")) {
    return { hex: colord(color).toHex() };
  }

  const arr = colorArray(color, model);
  if (!arr) {
    throw new Error(
      `Unsupported Color Error: Color \`${color}\` is not a supported color format.`,
    );
  }

  // For HWB, normalize whiteness and blackness before converting to other formats
  let normalizedColor = color;
  if (model === "hwb" && color.match(/^hwb\(/i)) {
    const [hue, whiteness, blackness, alpha] = arr;
    const [normalizedWhiteness, normalizedBlackness] = normalizeHwbValues(
      whiteness,
      blackness,
    );
    normalizedColor =
      alpha === 1
        ? `hwb(${hue} ${normalizedWhiteness}% ${normalizedBlackness}%)`
        : `hwb(${hue} ${normalizedWhiteness}% ${normalizedBlackness}% / ${alpha})`;
  }

  // For HSV, we don't need colord validation since we handle it manually
  if (model === "hsv") {
    return colorModels[model].reduce((acc, part, index) => {
      return { ...acc, [part]: arr[index] };
    }, {} as ColorParts);
  }

  // Use the normalized color for conversion, but return the raw components
  const colordColor = colord(normalizedColor);
  return colorModels[model].reduce((acc, part, index) => {
    return { ...acc, [part]: arr[index] };
  }, {} as ColorParts);
};

/**
 * Checks if a string is a valid color using colord.
 * @param str - The color string to validate.
 * @returns True if the string is a valid color, false otherwise.
 */
export const validColor = (str: string): boolean => {
  // For HSV, validate manually since colord doesn't support it
  if (str.match(/^hsv\(/i)) {
    const hsvValues = parseHsvString(str);
    return hsvValues !== null;
  }
  
  // For HWB, normalize before validation
  if (str.match(/^hwb\(/i)) {
    const rawValues = parseHwbString(str);
    if (!rawValues) {
      return false;
    }
    const [hue, whiteness, blackness, alpha] = rawValues;
    const [normalizedWhiteness, normalizedBlackness] = normalizeHwbValues(
      whiteness,
      blackness,
    );
    const normalizedStr =
      alpha === 1
        ? `hwb(${hue} ${normalizedWhiteness}% ${normalizedBlackness}%)`
        : `hwb(${hue} ${normalizedWhiteness}% ${normalizedBlackness}% / ${alpha})`;
    return colord(normalizedStr).isValid();
  }
  return colord(str).isValid();
};
