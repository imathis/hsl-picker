import { parse, rgb, hsl, hwb, oklch } from "culori";
import { ColorModel, ColorParts } from "../types";

/**
 * Rounds a number to a specified number of decimal places.
 * @param value - The number to round.
 * @param decimals - The number of decimal places (default: 1).
 * @returns The rounded number.
 */
const roundTo = (value: number, decimals: number = 1): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Defines the components of each color model.
 */
export const colorModels: ColorModel = {
  hsl: ["hue", "saturation", "luminosity", "alpha"],
  oklch: ["oklchLightness", "oklchChroma", "oklchHue", "alpha"],
  hwb: ["hue", "whiteness", "blackness", "alpha"],
  hsv: ["hue", "hsvSaturation", "value", "alpha"],
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
 * @param type - The color model type ("hex", "hsl", "hwb", "rgb", "oklch").
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
    oklch: ["([\\d.]+%?)", num, num], // lightness (% or decimal), chroma, hue
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
  oklch: colorPattern("oklch"),
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
 * Parses an OKLCH string directly to preserve raw input values for a color picker.
 * Accepts both percentage format (oklch(50% 0.2 180)) and decimal format (oklch(0.5 0.2 180)).
 * @param color - The OKLCH color string to parse.
 * @returns An array of numbers [lightness, chroma, hue, alpha], or null if invalid.
 */
export const parseOklchString = (color: string): number[] | null => {
  const oklchPattern = colorPattern("oklch");
  const match = color.match(oklchPattern);
  if (!match) {
    return null;
  }
  const [, lightnessStr, chroma, hue, alpha] = match;
  
  // Handle both percentage and decimal formats for lightness
  let lightness = Number.parseFloat(lightnessStr);
  
  // If the lightness string contains '%', remove it and convert to 0-1 scale
  if (lightnessStr.includes('%')) {
    // Percentage format, convert to 0-1 scale
    lightness = lightness / 100;
  } else {
    // Decimal format (0-1), use as-is
  }
  
  return [
    lightness, // lightness as 0-1 scale internally
    Number.parseFloat(chroma),
    Number.parseFloat(hue),
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
 * Determines the color model of a string using culori.
 * @param str - The color string to identify.
 * @returns The color model ("hsl", "hwb", "rgb", "oklch", or "hex").
 * @throws Error if no matching model is found.
 */
export const colorModel = (str: string): keyof ColorModel | "hex" => {
  // Check HSV first since we handle it manually
  if (str.match(/^hsv\(/i)) {
    const hsvValues = parseHsvString(str);
    if (hsvValues) {
      return "hsv";
    }
  }

  // Check OKLCH
  if (str.match(/^oklch\(/i)) {
    const oklchValues = parseOklchString(str);
    if (oklchValues) {
      return "oklch";
    }
  }

  const color = parse(str.toLowerCase());
  if (!color) {
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

  // Default to rgb for named colors and other formats culori supports
  return "rgb";
};

/**
 * Parses a color string into an array of numbers using culori, with special handling for HSL, HWB, HSV, and OKLCH to preserve raw input.
 * @param color - The color string to parse.
 * @param model - The color model to parse against.
 * @returns An array of numbers representing the color components, or null if invalid.
 */
export const colorArray = (
  color: string,
  model?: keyof ColorModel,
): number[] | null => {
  // Auto-detect model if not provided
  if (!model) {
    if (color.match(/^oklch\(/i)) {
      model = "oklch";
    } else if (color.match(/^hsv\(/i)) {
      model = "hsv";
    } else {
      model = color.slice(0, 3) as keyof ColorModel;
    }
  }
  // Special handling for HSV to preserve raw input values for color picker
  if (model === "hsv" && color.match(/^hsv\(/i)) {
    return parseHsvString(color);
  }

  // Special handling for OKLCH to preserve raw input values for color picker
  if (model === "oklch" && color.match(/^oklch\(/i)) {
    return parseOklchString(color);
  }

  // For non-HSV/OKLCH colors, validate with culori
  const culoriColor = parse(color.toLowerCase());
  if (!culoriColor) {
    return null;
  }

  // Special handling for HSL to preserve raw input values for color picker
  if (model === "hsl" && color.match(/^hsla?\(/i)) {
    return parseHslString(color);
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
      const rgbColor = rgb(culoriColor);
      if (!rgbColor) return null;
      return [
        roundTo(rgbColor.r * 255, 0),
        roundTo(rgbColor.g * 255, 0),
        roundTo(rgbColor.b * 255, 0),
        rgbColor.alpha ?? 1,
      ];
    }
    case "hsl": {
      const hslColor = hsl(culoriColor);
      if (!hslColor) return null;
      return [
        roundTo(hslColor.h ?? 0, 0),
        roundTo(hslColor.s * 100, 1),
        roundTo(hslColor.l * 100, 1),
        hslColor.alpha ?? 1,
      ];
    }
    case "hsv": {
      // HSV is handled manually since culori doesn't parse HSV strings directly
      return parseHsvString(color) || [0, 0, 0, 1];
    }
    case "hwb": {
      const hwbColor = hwb(culoriColor);
      if (!hwbColor) return null;
      return [
        roundTo(hwbColor.h ?? 0, 0),
        roundTo(hwbColor.w * 100, 1),
        roundTo(hwbColor.b * 100, 1),
        hwbColor.alpha ?? 1,
      ];
    }
    case "oklch": {
      const oklchColor = oklch(culoriColor);
      if (!oklchColor) return null;
      return [
        roundTo((oklchColor.l ?? 0) * 100, 1),
        roundTo(oklchColor.c ?? 0, 3),
        roundTo(oklchColor.h ?? 0, 0),
        oklchColor.alpha ?? 1,
      ];
    }
    default:
      return null;
  }
};

/**
 * Extracts color components from a color string using culori.
 * @param color - The color string to parse.
 * @param model - The color model to parse against.
 * @returns A ColorParts object with the parsed components.
 */
export const colorParts = (
  color: string,
  model?: keyof ColorModel | "hex",
): ColorParts => {
  // Auto-detect model if not provided
  if (!model) {
    if (color.startsWith("#")) {
      model = "hex";
    } else if (color.match(/^oklch\(/i)) {
      model = "oklch";
    } else if (color.match(/^hsv\(/i)) {
      model = "hsv";
    } else {
      model = color.slice(0, 3) as keyof ColorModel;
    }
  }
  if (model === "hex" || color.startsWith("#")) {
    const parsed = parse(color.toLowerCase());
    if (!parsed) {
      throw new Error(
        `Unsupported Color Error: Color \`${color}\` is not a supported color format.`,
      );
    }
    return { hex: rgb(parsed)?.hex ?? color };
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

  // For HSV and OKLCH, we don't need culori validation since we handle them manually
  if (model === "hsv" || model === "oklch") {
    return colorModels[model].reduce((acc, part, index) => {
      return { ...acc, [part]: arr[index] };
    }, {} as ColorParts);
  }

  // Use the normalized color for conversion, but return the raw components
  const culoriColor = parse(normalizedColor.toLowerCase());
  if (!culoriColor) {
    throw new Error(
      `Unsupported Color Error: Color \`${color}\` is not a supported color format.`,
    );
  }
  return colorModels[model].reduce((acc, part, index) => {
    return { ...acc, [part]: arr[index] };
  }, {} as ColorParts);
};

/**
 * Checks if a string is a valid color using culori.
 * @param str - The color string to validate.
 * @returns True if the string is a valid color, false otherwise.
 */
export const validColor = (str: string): boolean => {
  // For HSV, validate manually since culori doesn't support it directly
  if (str.match(/^hsv\(/i)) {
    const hsvValues = parseHsvString(str);
    return hsvValues !== null;
  }

  // For OKLCH, validate manually
  if (str.match(/^oklch\(/i)) {
    const oklchValues = parseOklchString(str);
    return oklchValues !== null;
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
    return parse(normalizedStr.toLowerCase()) !== undefined;
  }
  return parse(str.toLowerCase()) !== undefined;
};
