import { Colord, colord, extend } from "colord";
import hwbPlugin from "colord/plugins/hwb";
import namesPlugin from "colord/plugins/names";
import {
  ColorModel,
  ColorObject,
  ColorParts,
  HEXColor,
  HSLColor,
  HWBColor,
  RGBColor,
} from "../types";
import {
  colorModel,
  colorParts,
  normalizeHwbValues,
  parseHwbString,
} from "./colorParsing";

// Extend colord with HWB plugin
extend([hwbPlugin, namesPlugin]);

// Utility to format color objects as strings
export const toString = {
  hwb: ({ hue, whiteness, blackness, alpha }: HWBColor): string => {
    const main = `${hue} ${whiteness}% ${blackness}%`;
    return alpha !== undefined && alpha < 1
      ? `hwb(${main} / ${alpha})`
      : `hwb(${main})`;
  },
  hsl: ({ hue, saturation, luminosity, alpha }: HSLColor): string => {
    const main = `${hue} ${saturation}% ${luminosity}%`;
    return alpha !== undefined && alpha < 1
      ? `hsla(${main} / ${alpha})`
      : `hsl(${main})`;
  },
  rgb: ({ red, green, blue, alpha }: RGBColor): string => {
    const main = [red, green, blue].join(" ");
    return alpha !== undefined && alpha < 1
      ? `rgba(${main} / ${alpha})`
      : `rgb(${main})`;
  },
  hex: ({ hex }: HEXColor): string => hex,
} as const;

/**
 * Converts an RGB color to a hex string.
 * @param red - Red component (0-255).
 * @param green - Green component (0-255).
 * @param blue - Blue component (0-255).
 * @param alpha - Alpha component (0-1, optional).
 * @returns A hex color string (e.g., '#FF0000').
 */
export const rgbaToHex = ({ red, green, blue, alpha }: RGBColor): string => {
  const colors = [red, green, blue];
  if (alpha !== undefined && alpha < 1) colors.push(alpha);
  return `#${colors
    .map((n, i) =>
      (i === 3
        ? Math.round(parseFloat(String(n)) * 255)
        : parseFloat(String(n))
      )
        .toString(16)
        .padStart(2, "0")
        .replace("NaN", ""),
    )
    .join("")}`;
};

/**
 * Converts an RGB color to HSL and HWB representations.
 * @param red - Red component (0-255).
 * @param green - Green component (0-255).
 * @param blue - Blue component (0-255).
 * @param alpha - Alpha component (0-1, optional)/ .
 * @returns An object with HSL and HWB components and strings.
 */
export const toHslwb = (rgb: RGBColor) => {
  // Create a colord instance from the RGB object
  const colordColor = colord({
    r: rgb.red,
    g: rgb.green,
    b: rgb.blue,
    a: rgb.alpha ?? 1,
  });

  // Convert to HSL
  let { h: hue, s: saturation, l: luminosity, a: alpha } = colordColor.toHsl();

  // Convert to HWB
  let { w: whiteness, b: blackness } = colordColor.toHwb();

  // Stabilize hue for achromatic colors (saturation close to 0)
  if (saturation < 0.01) {
    // Threshold for considering a color achromatic
    hue = 0;
    saturation = 0;
  }

  // Create HSL and HWB color objects for string formatting
  const hslColor: HSLColor = {
    hue,
    saturation,
    luminosity,
    ...(alpha !== 1 && { alpha }),
  };

  const hwbColor: HWBColor = {
    hue,
    whiteness,
    blackness,
    ...(alpha !== 1 && { alpha }),
  };

  return {
    hue,
    saturation,
    luminosity,
    whiteness,
    blackness,
    alpha,
    hsl: toString.hsl(hslColor),
    hwb: toString.hwb(hwbColor),
  };
};

/**
 * Converts a color string to RGB representation using colord.
 * @param str - The color string to convert.
 * @returns An object with RGB components and hex string.
 */
export const toRgb = (
  str: string,
): {
  red: number;
  green: number;
  blue: number;
  alpha: number;
  rgb: string;
  hex: string;
} => {
  try {
    // Normalize HWB colors before passing to colord
    let normalizedStr = str;
    if (str.match(/^hwb\(/i)) {
      const hwbValues = parseHwbString(str);
      if (!hwbValues) {
        throw new Error(`Invalid HWB color: ${str}`);
      }
      const [hue, whiteness, blackness, alpha] = hwbValues;
      const [normalizedWhiteness, normalizedBlackness] = normalizeHwbValues(
        whiteness,
        blackness,
      );
      normalizedStr =
        alpha === 1
          ? `hwb(${hue} ${normalizedWhiteness}% ${normalizedBlackness}%)`
          : `hwb(${hue} ${normalizedWhiteness}% ${normalizedBlackness}% / ${alpha})`;
    }

    const color: Colord = colord(normalizedStr);
    if (!color.isValid()) {
      throw new Error(`Invalid color: ${normalizedStr}`);
    }
    const { r: red, g: green, b: blue, a: alpha } = color.toRgb();
    const rgb = toString.rgb({ red, green, blue, alpha });
    const hex = rgbaToHex({ red, green, blue, alpha });

    return {
      red,
      green,
      blue,
      alpha,
      rgb,
      hex,
    };
  } catch (e) {
    throw new Error(`Invalid Color Error: \`${str}\` is not a valid color.`);
  }
};

/**
 * Creates a ColorObject from a color string.
 * @param color - The color string to parse.
 * @param m - Optional color model to use.
 * @returns A ColorObject representing the color.
 * @throws Error if the color string is invalid.
 */
export const createColorObject = (
  color: string,
  m?: keyof ColorModel | "hex",
): ColorObject => {
  const model = m || colorModel(color);
  if (!model) throw new Error(`No matching color model found for ${color}`);

  const rgb = toRgb(color);
  const hslwb = toHslwb(rgb);
  const resolvedModel: keyof ColorModel | "hex" =
    model === "hex" ? "rgb" : model;
  const currentParts = colorParts(color, resolvedModel);

  const current: Partial<ColorObject> = currentParts;
  if ("hex" in currentParts) {
    current.hex = currentParts.hex;
  } else if ("red" in currentParts) {
    current.red = currentParts.red;
    current.green = currentParts.green;
    current.blue = currentParts.blue;
    current.alpha = currentParts.alpha ?? 1;
  } else if ("hue" in currentParts && "saturation" in currentParts) {
    current.hue = currentParts.hue;
    current.saturation = currentParts.saturation;
    current.luminosity = currentParts.luminosity;
    current.alpha = currentParts.alpha ?? 1;
  } else if ("hue" in currentParts && "whiteness" in currentParts) {
    current.hue = currentParts.hue;
    current.whiteness = currentParts.whiteness;
    current.blackness = currentParts.blackness;
    current.alpha = currentParts.alpha ?? 1;
  }

  const colorObj: ColorObject = {
    model,
    hue: hslwb.hue,
    saturation: hslwb.saturation,
    luminosity: hslwb.luminosity,
    whiteness: hslwb.whiteness,
    blackness: hslwb.blackness,
    alpha: hslwb.alpha,
    red: rgb.red,
    green: rgb.green,
    blue: rgb.blue,
    hex: rgb.hex,
    hsl: hslwb.hsl,
    hwb: hslwb.hwb,
    rgb: rgb.rgb,
    ...current,
    [model]: color,
    set: ({
      model: setModel,
      ...adj
    }: Partial<ColorParts> & { model?: keyof ColorModel | "hex" }) => {
      const targetModel = setModel ?? colorObj.model;
      const updated: ColorParts = { ...colorObj, ...adj };
      let str: string;
      switch (targetModel) {
        case "hsl":
          str = toString.hsl(updated as HSLColor);
          break;
        case "hwb":
          str = toString.hwb(updated as HWBColor);
          break;
        case "rgb":
          str = toString.rgb(updated as RGBColor);
          break;
        case "hex":
          str = toString.hex(updated as HEXColor);
          break;
        default:
          throw new Error(`Unsupported color model: ${targetModel}`);
      }
      return createColorObject(str, targetModel);
    },
    toString: (targetModel?: keyof ColorModel | "hex") => {
      if (!targetModel) return colorObj[colorObj.model];
      switch (targetModel) {
        case "hsl":
          return toString.hsl(colorObj as HSLColor);
        case "hwb":
          return toString.hwb(colorObj as HWBColor);
        case "rgb":
          return toString.rgb(colorObj as RGBColor);
        case "hex":
          return toString.hex(colorObj as HEXColor);
        default:
          throw new Error(`Unsupported color model: ${targetModel}`);
      }
    },
  };

  return colorObj;
};
