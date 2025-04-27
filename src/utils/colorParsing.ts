import { ColorModel, ColorParts } from "../types";

/**
 * Defines the components of each color model.
 */
export const colorModels: ColorModel = {
  hsl: ["hue", "saturation", "luminosity", "alpha"],
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
const ColorTest = (type: keyof ColorModel | "hex"): RegExp => {
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
  hsl: ColorTest("hsl"),
  hwb: ColorTest("hwb"),
  rgb: ColorTest("rgb"),
  hex: ColorTest("hex"),
};

/**
 * Tests if a string matches a color format.
 */
const isColor: {
  [key in keyof ColorModel | "hex"]: (str: string) => string[] | null;
} = {
  hsl: (str: string) => str.match(ColorTest("hsl"))?.slice(1) || null,
  hwb: (str: string) => str.match(ColorTest("hwb"))?.slice(1) || null,
  rgb: (str: string) => str.match(ColorTest("rgb"))?.slice(1) || null,
  hex: (str: string) => str.match(ColorTest("hex"))?.slice(1) || null,
};

/**
 * Parses a color string into an array of numbers.
 * @param color - The color string to parse.
 * @param model - The color model to parse against.
 * @returns An array of numbers representing the color components, or null if invalid.
 */
export const colorArray = (
  color: string,
  model: keyof ColorModel = color.slice(0, 3) as keyof ColorModel,
): number[] | null => {
  const is = isColor[model](color);
  return is?.map((n) => (n === undefined ? 1 : Number.parseFloat(n))) || null;
};

/**
 * Extracts color components from a color string.
 * @param color - The color string to parse.
 * @param model - The color model to parse against.
 * @returns A ColorParts object with the parsed components.
 */
export const colorParts = (
  color: string,
  model: keyof ColorModel | "hex" = color.slice(0, 3) as keyof ColorModel,
): ColorParts => {
  try {
    if (model === "hex" || color.startsWith("#")) return { hex: color };
    const arr = colorArray(color, model);
    if (!arr) throw new Error("Invalid color format");
    return colorModels[model].reduce((acc, part, index) => {
      return { ...acc, [part]: arr[index] };
    }, {} as ColorParts);
  } catch (e) {
    console.error(e);
    throw new Error(
      `Unsupported Color Error: Color \`${color}\` is not a supported color format.`,
    );
  }
};

/**
 * Checks if a number is within a specified range.
 * @param num - The number to check.
 * @param opts - Options specifying the range (default: 0-100).
 * @returns True if the number is within the range, false otherwise.
 */
const inbound = (
  num: number,
  opts: { min?: number; max?: number } = {},
): boolean => {
  const { min = 0, max = 100 } = opts;
  return min <= num && num <= max;
};

/**
 * Validates an HSL or HWB color string.
 * @param color - The color string to validate.
 * @param model - The color model ("hsl" or "hwb").
 * @returns True if the color string is valid, false otherwise.
 */
const testHex = (color: string, model: keyof ColorModel): boolean => {
  const arr = colorArray(color, model);
  if (!arr) return false;
  const [hue, sw, lwb, alpha] = arr;
  return (
    inbound(hue, { max: 360 }) &&
    inbound(sw) &&
    inbound(lwb) &&
    (alpha === undefined || inbound(alpha, { max: 1 }))
  );
};

/**
 * Validates an RGB color string.
 * @param color - The color string to validate.
 * @param model - The color model ("rgb").
 * @returns True if the color string is valid, false otherwise.
 */
const testRgb = (color: string, model: keyof ColorModel): boolean => {
  const arr = colorArray(color, model);
  if (!arr) return false;
  const [r, g, b, alpha] = arr;
  return (
    inbound(r, { max: 255 }) &&
    inbound(g, { max: 255 }) &&
    inbound(b, { max: 255 }) &&
    (alpha === undefined || inbound(alpha, { max: 1 }))
  );
};

/**
 * Validation functions for each color model.
 */
export const validate: {
  [key in keyof ColorModel | "hex"]: (str: string) => boolean;
} = {
  hsl: (str: string) => testHex(str, "hsl"),
  hwb: (str: string) => testHex(str, "hwb"),
  rgb: (str: string) => testRgb(str, "rgb"),
  hex: (str: string) => !!isColor.hex(str),
};

/**
 * Determines the color model of a string.
 * @param str - The color string to identify.
 * @returns The color model ("hsl", "hwb", "rgb", or "hex").
 * @throws Error if no matching model is found.
 */
export const colorModel = (str: string): keyof ColorModel | "hex" => {
  const model = Object.keys(isColor).find((type) =>
    isColor[type as keyof typeof isColor](str),
  ) as keyof ColorModel | "hex";
  if (!model) {
    throw new Error(
      `Color Error: No matching color model could be found for ${str}`,
    );
  }
  return model;
};

/**
 * Checks if a string is a valid color.
 * @param str - The color string to validate.
 * @returns True if the string is a valid color, false otherwise.
 */
export const validColor = (str: string): boolean => !!colorModel(str);
