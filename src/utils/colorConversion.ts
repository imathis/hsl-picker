import { parse, rgb, hsl, hwb } from "culori";

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
import {
  ColorModel,
  ColorObject,
  ColorParts,
  HEXColor,
  HSLColor,
  HSVColor,
  HWBColor,
  RGBColor,
} from "../types";
import {
  colorModel,
  colorParts,
  normalizeHwbValues,
  parseHwbString,
  parseHsvString,
} from "./colorParsing";


/**
 * Converts HSV to RGB.
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param v - Value (0-100)
 * @returns RGB values (0-255)
 */
export const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const vNorm = v / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
  const m = vNorm - c;

  let r = 0, g = 0, b = 0;

  if (hNorm >= 0 && hNorm < 1/6) {
    r = c; g = x; b = 0;
  } else if (hNorm >= 1/6 && hNorm < 2/6) {
    r = x; g = c; b = 0;
  } else if (hNorm >= 2/6 && hNorm < 3/6) {
    r = 0; g = c; b = x;
  } else if (hNorm >= 3/6 && hNorm < 4/6) {
    r = 0; g = x; b = c;
  } else if (hNorm >= 4/6 && hNorm < 5/6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
};

/**
 * Converts RGB to HSV.
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns HSV values [h: 0-360, s: 0-100, v: 0-100]
 */
export const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);

  return [h, s, v];
};

// Utility to format color objects as strings
export const toString = {
  hsl: ({ hue, saturation, luminosity, alpha }: HSLColor): string => {
    const main = `${roundTo(hue, 0)} ${roundTo(saturation, 1)}% ${roundTo(luminosity, 1)}%`;
    return alpha !== undefined && alpha < 1
      ? `hsla(${main} / ${roundTo(alpha, 2)})`
      : `hsl(${main})`;
  },
  hsv: ({ hue, hsvSaturation, value, alpha }: HSVColor): string => {
    const main = `${roundTo(hue, 0)} ${roundTo(hsvSaturation, 1)}% ${roundTo(value, 1)}%`;
    return alpha !== undefined && alpha < 1
      ? `hsv(${main} / ${roundTo(alpha, 2)})`
      : `hsv(${main})`;
  },
  hwb: ({ hue, whiteness, blackness, alpha }: HWBColor): string => {
    const main = `${roundTo(hue, 0)} ${roundTo(whiteness, 1)}% ${roundTo(blackness, 1)}%`;
    return alpha !== undefined && alpha < 1
      ? `hwb(${main} / ${roundTo(alpha, 2)})`
      : `hwb(${main})`;
  },
  rgb: ({ red, green, blue, alpha }: RGBColor): string => {
    const main = [roundTo(red, 0), roundTo(green, 0), roundTo(blue, 0)].join(" ");
    return alpha !== undefined && alpha < 1
      ? `rgba(${main} / ${roundTo(alpha, 2)})`
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
 * Converts an RGB color to HSL, HSV, and HWB representations.
 * @param red - Red component (0-255).
 * @param green - Green component (0-255).
 * @param blue - Blue component (0-255).
 * @param alpha - Alpha component (0-1, optional)/ .
 * @returns An object with HSL, HSV, and HWB components and strings.
 */
export const toHslvwb = (rgb: RGBColor) => {
  // Create a culori RGB color object
  const culoriRgb = {
    mode: 'rgb' as const,
    r: rgb.red / 255,
    g: rgb.green / 255,
    b: rgb.blue / 255,
    alpha: rgb.alpha ?? 1,
  };

  // Convert to HSL
  const culoriHsl = hsl(culoriRgb);
  let hue = roundTo(culoriHsl?.h ?? 0, 0);
  let saturation = roundTo((culoriHsl?.s ?? 0) * 100, 1);
  let luminosity = roundTo((culoriHsl?.l ?? 0) * 100, 1);
  let alpha = culoriHsl?.alpha ?? 1;

  // Convert to HSV using manual conversion
  let [hsvHueRaw, hsvSaturation, value] = rgbToHsv(rgb.red, rgb.green, rgb.blue);
  let hsvHue = roundTo(hsvHueRaw, 0);

  // Convert to HWB
  const culoriHwb = hwb(culoriRgb);
  let whiteness = roundTo((culoriHwb?.w ?? 0) * 100, 1);
  let blackness = roundTo((culoriHwb?.b ?? 0) * 100, 1);

  // Stabilize hue for achromatic colors (saturation close to 0)
  if (saturation < 0.01) {
    // Threshold for considering a color achromatic
    hue = 0;
    hsvHue = 0;
    saturation = 0;
    hsvSaturation = 0;
  }

  // Create HSL, HSV, and HWB color objects for string formatting
  const hslColor: HSLColor = {
    hue,
    saturation,
    luminosity,
    ...(alpha !== 1 && { alpha }),
  };

  const hsvColor: HSVColor = {
    hue: hsvHue,
    hsvSaturation,
    value,
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
    hsvSaturation,
    value,
    whiteness,
    blackness,
    alpha,
    hsl: toString.hsl(hslColor),
    hsv: toString.hsv(hsvColor),
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
    let red: number, green: number, blue: number, alpha: number = 1;
    
    // Handle HSV colors by converting to RGB directly
    if (str.match(/^hsv\(/i)) {
      const hsvValues = parseHsvString(str);
      if (!hsvValues) {
        throw new Error(`Invalid HSV color: ${str}`);
      }
      const [h, s, v, a] = hsvValues;
      [red, green, blue] = hsvToRgb(h, s, v);
      alpha = a;
    } else {
      // Handle other color formats with culori
      let normalizedStr = str;
      
      // Normalize HWB colors before passing to culori
      if (str.match(/^hwb\(/i)) {
        const hwbValues = parseHwbString(str);
        if (!hwbValues) {
          throw new Error(`Invalid HWB color: ${str}`);
        }
        const [hue, whiteness, blackness, alphaVal] = hwbValues;
        const [normalizedWhiteness, normalizedBlackness] = normalizeHwbValues(
          whiteness,
          blackness,
        );
        normalizedStr =
          alphaVal === 1
            ? `hwb(${hue} ${normalizedWhiteness}% ${normalizedBlackness}%)`
            : `hwb(${hue} ${normalizedWhiteness}% ${normalizedBlackness}% / ${alphaVal})`;
      }

      const color = parse(normalizedStr.toLowerCase());
      if (!color) {
        throw new Error(`Invalid color: ${normalizedStr}`);
      }
      const rgbColor = rgb(color);
      if (!rgbColor) {
        throw new Error(`Failed to convert to RGB: ${normalizedStr}`);
      }
      red = Math.round(rgbColor.r * 255);
      green = Math.round(rgbColor.g * 255);
      blue = Math.round(rgbColor.b * 255);
      alpha = rgbColor.alpha ?? 1;
    }

    const rgbString = toString.rgb({ red, green, blue, alpha });
    const hexString = rgbaToHex({ red, green, blue, alpha });

    return {
      red,
      green,
      blue,
      alpha,
      rgb: rgbString,
      hex: hexString,
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
  const hslvwb = toHslvwb(rgb);
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
  } else if ("hue" in currentParts && "saturation" in currentParts && "luminosity" in currentParts) {
    current.hue = currentParts.hue;
    current.saturation = currentParts.saturation;
    current.luminosity = currentParts.luminosity;
    current.alpha = currentParts.alpha ?? 1;
  } else if ("hue" in currentParts && "hsvSaturation" in currentParts && "value" in currentParts) {
    current.hue = currentParts.hue;
    current.hsvSaturation = currentParts.hsvSaturation;
    current.value = currentParts.value;
    current.alpha = currentParts.alpha ?? 1;
  } else if ("hue" in currentParts && "whiteness" in currentParts) {
    current.hue = currentParts.hue;
    current.whiteness = currentParts.whiteness;
    current.blackness = currentParts.blackness;
    current.alpha = currentParts.alpha ?? 1;
  }

  const colorObj: ColorObject = {
    model,
    hue: hslvwb.hue,
    saturation: hslvwb.saturation,
    luminosity: hslvwb.luminosity,
    hsvSaturation: hslvwb.hsvSaturation,
    value: hslvwb.value,
    whiteness: hslvwb.whiteness,
    blackness: hslvwb.blackness,
    alpha: hslvwb.alpha,
    red: rgb.red,
    green: rgb.green,
    blue: rgb.blue,
    hex: rgb.hex,
    hsl: hslvwb.hsl,
    hsv: hslvwb.hsv,
    hwb: hslvwb.hwb,
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
        case "hsv":
          str = toString.hsv(updated as HSVColor);
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
        case "hsv":
          return toString.hsv(colorObj as HSVColor);
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
