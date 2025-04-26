import {
  ColorModel,
  ColorObject,
  ColorParts,
  HEXColor,
  HSLColor,
  HWBColor,
  RGBColor,
} from "../types";
import { colorModel, colorParts } from "./colorParsing";

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
 * @returns A hex color string (e.g., "#FF0000").
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
 * @param alpha - Alpha component (0-1, optional).
 * @returns An object with HSL and HWB components and strings.
 */
export const toHslwb = ({
  red,
  green,
  blue,
  alpha,
}: RGBColor): {
  hue: number;
  saturation: number;
  luminosity: number;
  whiteness: number;
  blackness: number;
  alpha: number;
  hsl: string;
  hwb: string;
} => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h: number, w: number, wb: number, s: number;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
    w = max;
    wb = 1 - max;
  } else {
    w = min;
    wb = 1 - max;
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    if (max === r) {
      h = (g - b) / diff + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }

    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 1000) / 10;
  l = Math.round(l * 1000) / 10;
  w = Math.round(w * 1000) / 10;
  wb = Math.round(wb * 1000) / 10;

  const obj: HSLColor & HWBColor = {
    hue: h,
    saturation: s,
    luminosity: l,
    whiteness: w,
    blackness: wb,
    alpha: alpha ?? 1,
  };

  const hsl = toString.hsl(obj as HSLColor);
  const hwb = toString.hwb(obj as HWBColor);

  return {
    hue: h,
    saturation: s,
    luminosity: l,
    whiteness: w,
    blackness: wb,
    alpha: alpha ?? 1,
    hsl,
    hwb,
  };
};

/**
 * Converts a color string to RGB representation.
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
    // Use the browser's style parsing to normalize the color
    const el = document.createElement("div");
    el.style.color = str;
    const { color } = window.getComputedStyle(document.body.appendChild(el));
    const rgba = colorParts(color, "rgb") as RGBColor;
    document.body.removeChild(el);

    const rgb = toString.rgb(rgba);
    const hex = rgbaToHex(rgba);

    return {
      red: rgba.red,
      green: rgba.green,
      blue: rgba.blue,
      alpha: rgba.alpha ?? 1,
      rgb,
      hex,
    };
  } catch (e) {
    throw new Error(
      `Invalid Color Error: Browser does not recognize \`${str}\` as a valid color.`,
    );
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

  // Build the ColorObject by combining parsed components
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
