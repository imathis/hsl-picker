import { parse, rgb, hsl, hwb, hsv, oklch, inGamut, clampChroma } from "culori";

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
  OKLCHColor,
} from "../types";
import {
  colorModel,
  colorParts,
  normalizeHwbValues,
  parseHwbString,
  parseHsvString,
  parseOklchString,
} from "./colorParsing";



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
  oklch: ({ oklchLightness, oklchChroma, oklchHue, alpha }: OKLCHColor): string => {
    const main = `${roundTo(oklchLightness, 3)} ${roundTo(oklchChroma, 3)} ${roundTo(oklchHue, 3)}`;
    return alpha !== undefined && alpha < 1
      ? `oklch(${main} / ${roundTo(alpha, 2)})`
      : `oklch(${main})`;
  },
  hex: ({ hex }: HEXColor): string => hex,
} as const;

/**
 * Checks if an OKLCH color is within the sRGB gamut.
 * @param oklchColor - OKLCH color object with l, c, h properties.
 * @returns True if the color is within sRGB gamut, false otherwise.
 */
export const isInGamut = (oklchColor: { l: number; c: number; h: number; alpha?: number }): boolean => {
  const culoriColor = { mode: 'oklch' as const, ...oklchColor };
  return inGamut('rgb')(culoriColor);
};

/**
 * Gets the closest sRGB color for an out-of-gamut OKLCH color.
 * @param oklchColor - OKLCH color object with l, c, h properties.
 * @returns An sRGB-clamped version of the color.
 */
export const getGamutMappedColor = (oklchColor: { l: number; c: number; h: number; alpha?: number }) => {
  const culoriColor = { mode: 'oklch' as const, ...oklchColor };
  const clampedColor = clampChroma(culoriColor, 'rgb');
  return clampedColor;
};

/**
 * Converts an RGB color to a hex string.
 * @param red - Red component (0-255).
 * @param green - Green component (0-255).
 * @param blue - Blue component (0-255).
 * @param alpha - Alpha component (0-1, optional).
 * @returns A hex color string (e.g., '#FF0000').
 */
export const rgbaToHex = ({ red, green, blue, alpha }: RGBColor): string => {
  // Ensure all RGB values are valid numbers and within range
  const r = Math.max(0, Math.min(255, Math.round(parseFloat(String(red)) || 0)));
  const g = Math.max(0, Math.min(255, Math.round(parseFloat(String(green)) || 0)));
  const b = Math.max(0, Math.min(255, Math.round(parseFloat(String(blue)) || 0)));
  
  const colors = [r, g, b];
  if (alpha !== undefined && alpha < 1) {
    const a = Math.max(0, Math.min(255, Math.round((parseFloat(String(alpha)) || 0) * 255)));
    colors.push(a);
  }
  
  return `#${colors
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
};

/**
 * Converts an RGB color to HSL, HSV, HWB, and OKLCH representations.
 * @param red - Red component (0-255).
 * @param green - Green component (0-255).
 * @param blue - Blue component (0-255).
 * @param alpha - Alpha component (0-1, optional)/ .
 * @returns An object with HSL, HSV, HWB, and OKLCH components and strings.
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
  const luminosity = roundTo((culoriHsl?.l ?? 0) * 100, 1);
  const alpha = culoriHsl?.alpha ?? 1;

  // Convert to HSV using culori
  const culoriHsv = hsv(culoriRgb);
  let hsvHue = roundTo(culoriHsv?.h ?? 0, 0);
  let hsvSaturation = roundTo((culoriHsv?.s ?? 0) * 100, 1);
  const value = roundTo((culoriHsv?.v ?? 0) * 100, 1);

  // Convert to HWB
  const culoriHwb = hwb(culoriRgb);
  const whiteness = roundTo((culoriHwb?.w ?? 0) * 100, 1);
  const blackness = roundTo((culoriHwb?.b ?? 0) * 100, 1);

  // Convert to OKLCH
  const culoriOklch = oklch(culoriRgb);
  const oklchLightness = roundTo(culoriOklch?.l ?? 0, 3);
  const oklchChroma = roundTo(culoriOklch?.c ?? 0, 3);
  let oklchHue = roundTo(culoriOklch?.h ?? 0, 0);

  // Stabilize hue only if it's actually undefined (NaN) from the conversion
  // Don't force hue to 0 just because saturation is low - preserve hue information
  if (isNaN(hue) || hue === undefined) {
    hue = 0;
  }
  if (isNaN(hsvHue) || hsvHue === undefined) {
    hsvHue = 0;
  }
  if (isNaN(oklchHue) || oklchHue === undefined) {
    oklchHue = 0;
  }
  
  // Clean up very small saturation values to true zero
  if (saturation < 0.01) {
    saturation = 0;
  }
  if (hsvSaturation < 0.01) {
    hsvSaturation = 0;
  }

  // Create HSL, HSV, HWB, and OKLCH color objects for string formatting
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

  const oklchColor: OKLCHColor = {
    oklchLightness,
    oklchChroma,
    oklchHue,
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
    oklchLightness,
    oklchChroma,
    oklchHue,
    alpha,
    hsl: toString.hsl(hslColor),
    hsv: toString.hsv(hsvColor),
    hwb: toString.hwb(hwbColor),
    oklch: toString.oklch(oklchColor),
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
      const hsvColor = { mode: 'hsv' as const, h, s: s / 100, v: v / 100, alpha: a };
      const rgbColor = rgb(hsvColor);
      if (!rgbColor) {
        throw new Error(`Failed to convert HSV to RGB: ${str}`);
      }
      red = Math.round(rgbColor.r * 255);
      green = Math.round(rgbColor.g * 255);
      blue = Math.round(rgbColor.b * 255);
      alpha = a;
    } else if (str.match(/^oklch\(/i)) {
      // Handle OKLCH colors by converting to RGB directly
      const oklchValues = parseOklchString(str);
      if (!oklchValues) {
        throw new Error(`Invalid OKLCH color: ${str}`);
      }
      const [l, c, h, a] = oklchValues;
      const oklchColor = { mode: 'oklch' as const, l: l, c, h, alpha: a };
      
      // Convert to RGB first
      let rgbColor = rgb(oklchColor);
      if (!rgbColor) {
        throw new Error(`Failed to convert OKLCH to RGB: ${str}`);
      }
      
      // Only clamp if RGB values are actually invalid (not just out of gamut)
      const needsClamping = rgbColor.r < 0 || rgbColor.r > 1 || 
                           rgbColor.g < 0 || rgbColor.g > 1 || 
                           rgbColor.b < 0 || rgbColor.b > 1;
      
      if (needsClamping) {
        // Color produces invalid RGB values, clamp it
        const clampedColor = clampChroma(oklchColor, 'rgb');
        rgbColor = rgb(clampedColor);
      }
      
      if (!rgbColor) {
        throw new Error(`Failed to convert OKLCH to RGB: ${str}`);
      }
      
      // Ensure RGB values are valid (0-255)
      red = Math.max(0, Math.min(255, Math.round(rgbColor.r * 255)));
      green = Math.max(0, Math.min(255, Math.round(rgbColor.g * 255)));
      blue = Math.max(0, Math.min(255, Math.round(rgbColor.b * 255)));
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
  } catch (_e) {
    throw new Error(`Invalid Color Error: \`${str}\` is not a valid color.`);
  }
};

/**
 * Creates a comprehensive ColorObject from any supported color string format.
 * 
 * This function handles the complex task of:
 * 1. Parsing various color formats (hex, rgb, hsl, hsv, hwb, oklch)
 * 2. Converting between color spaces using the culori library
 * 3. Extracting individual color components for UI controls
 * 4. Generating string representations for each color model
 * 
 * The culori library handles the mathematical transformations between color spaces,
 * ensuring accurate conversions while preserving color fidelity.
 * 
 * @param color - The color string to parse (any supported format)
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
  } else if ("oklchLightness" in currentParts && "oklchChroma" in currentParts) {
    current.oklchLightness = currentParts.oklchLightness;
    current.oklchChroma = currentParts.oklchChroma;
    current.oklchHue = currentParts.oklchHue;
    current.alpha = currentParts.alpha ?? 1;
  }

  // HUE PRESERVATION STRATEGY: Prevent unwanted hue shifts during color space conversions
  // Problem: Achromatic colors (gray, black, white) lose hue information during RGB roundtrip
  // Why critical: User expects hue slider to remember position even when saturation/chroma = 0
  // Solution: Detect achromatic conditions and preserve original hue values
  
  // ACHROMATIC DETECTION: Multiple criteria to catch edge cases
  const isLowSaturation = hslvwb.saturation < 0.1 && hslvwb.hsvSaturation < 0.1;
  const isLowChroma = hslvwb.oklchChroma < 0.02; // Wide threshold for colors like 0.012 chroma
  const isFullyBlack = hslvwb.luminosity < 0.1 || hslvwb.value < 0.1 || hslvwb.oklchLightness < 0.01;
  const isFullyWhite = (hslvwb.luminosity > 99.9 && hslvwb.saturation === 0) || 
                       (hslvwb.whiteness > 99.9) ||
                       (hslvwb.oklchLightness > 0.99 && hslvwb.oklchChroma < 0.01);
  
  const isAchromatic = isLowSaturation || isLowChroma || isFullyBlack || isFullyWhite;
  
  // HUE VALUE PRESERVATION: Use original hue from source model when achromatic
  // Prevents hue sliders from jumping to 0° when user adjusts saturation/lightness
  let preservedHue = hslvwb.hue;
  let preservedOklchHue = hslvwb.oklchHue;
  
  if (isAchromatic) {
    // If source has HSL/HSV/HWB hue, use that for HSL/HWB preservation
    if (current.hue !== undefined) {
      preservedHue = current.hue;
    }
    // If source has OKLCH hue, use that for OKLCH preservation
    if (current.oklchHue !== undefined) {
      preservedOklchHue = current.oklchHue;
    }
    // If source is OKLCH and we don't have HSL hue, try to preserve OKLCH hue as HSL hue too
    if (model === "oklch" && current.hue === undefined && current.oklchHue !== undefined) {
      preservedHue = current.oklchHue;
    }
    // If source is HSL/etc and we don't have OKLCH hue, try to preserve HSL hue as OKLCH hue too
    if (model !== "oklch" && current.oklchHue === undefined && current.hue !== undefined) {
      preservedOklchHue = current.hue;
    }
  }
  
  // Generate color strings with preserved hues if achromatic
  let finalHsl = hslvwb.hsl;
  let finalHsv = hslvwb.hsv;
  let finalHwb = hslvwb.hwb;
  let finalOklch = hslvwb.oklch;
  
  if (isAchromatic && preservedHue !== hslvwb.hue) {
    // Regenerate HSL/HSV/HWB strings with preserved hue
    const hslColor: HSLColor = { hue: preservedHue, saturation: hslvwb.saturation, luminosity: hslvwb.luminosity, alpha: hslvwb.alpha };
    const hsvColor: HSVColor = { hue: preservedHue, hsvSaturation: hslvwb.hsvSaturation, value: hslvwb.value, alpha: hslvwb.alpha };
    const hwbColor: HWBColor = { hue: preservedHue, whiteness: hslvwb.whiteness, blackness: hslvwb.blackness, alpha: hslvwb.alpha };
    
    finalHsl = toString.hsl(hslColor);
    finalHsv = toString.hsv(hsvColor);
    finalHwb = toString.hwb(hwbColor);
  }
  
  if (isAchromatic && preservedOklchHue !== hslvwb.oklchHue) {
    // Regenerate OKLCH string with preserved hue
    const oklchColor: OKLCHColor = { oklchLightness: hslvwb.oklchLightness, oklchChroma: hslvwb.oklchChroma, oklchHue: preservedOklchHue, alpha: hslvwb.alpha };
    finalOklch = toString.oklch(oklchColor);
  }
  
  // For OKLCH source, preserve original string for better precision if values match
  if (model === "oklch" && current.oklchLightness !== undefined && current.oklchChroma !== undefined && current.oklchHue !== undefined) {
    const oklchColor: OKLCHColor = { 
      oklchLightness: current.oklchLightness, 
      oklchChroma: current.oklchChroma, 
      oklchHue: current.oklchHue, 
      alpha: current.alpha 
    };
    finalOklch = toString.oklch(oklchColor);
  }
  
  const colorObj: ColorObject = {
    model,
    // Use preserved hue values
    hue: preservedHue,
    saturation: hslvwb.saturation,
    luminosity: hslvwb.luminosity,
    hsvSaturation: hslvwb.hsvSaturation,
    value: hslvwb.value,
    whiteness: hslvwb.whiteness,
    blackness: hslvwb.blackness,
    oklchLightness: hslvwb.oklchLightness,
    oklchChroma: hslvwb.oklchChroma,
    oklchHue: preservedOklchHue,
    alpha: hslvwb.alpha,
    red: rgb.red,
    green: rgb.green,
    blue: rgb.blue,
    hex: rgb.hex,
    hsl: finalHsl,
    hsv: finalHsv,
    hwb: finalHwb,
    oklch: finalOklch,
    rgb: rgb.rgb,
    ...current,
    [model]: model === "oklch" ? finalOklch : color,
    set: ({
      model: setModel,
      ...adj
    }: Partial<ColorParts> & { model?: keyof ColorModel | "hex" }) => {
      const targetModel = setModel ?? colorObj.model;
      const updated: ColorParts = { ...colorObj, ...adj };
      
      // SPECIAL CASE: Preserve exact values and hue for model-specific adjustments
      const adjustmentKeys = Object.keys(adj).filter(key => key !== 'model');
      
      // CRITICAL: OKLCH precision preservation to prevent wide-gamut color degradation
      // Problem: OKLCH -> RGB -> OKLCH conversions lose precision for wide-gamut colors
      // Solution: For OKLCH-only adjustments (lightness, chroma, hue), bypass RGB roundtrip
      if (targetModel === "oklch" && colorObj.model === "oklch") {
        const oklchKeys = ['oklchLightness', 'oklchChroma', 'oklchHue', 'alpha'];
        const isOklchOnlyAdjustment = adjustmentKeys.every(key => oklchKeys.includes(key));
        
        if (isOklchOnlyAdjustment) {
          // Preserve exact OKLCH values, avoid RGB roundtrip
          const preservedOklch: OKLCHColor = {
            oklchLightness: adj.oklchLightness ?? colorObj.oklchLightness,
            oklchChroma: adj.oklchChroma ?? colorObj.oklchChroma,
            oklchHue: adj.oklchHue ?? colorObj.oklchHue,
            alpha: adj.alpha ?? colorObj.alpha,
          };
          
          // Generate the OKLCH string with preserved values
          const oklchString = toString.oklch(preservedOklch);
          
          // Create a full ColorObject but manually override the OKLCH values
          // after the RGB roundtrip to preserve precision
          const newColorObj = createColorObject(oklchString, "oklch");
          
          // CRITICAL: Override with exact values to prevent RGB conversion precision loss
          // This maintains values like oklchHue: 331.132 instead of 331.13199...
          newColorObj.oklchLightness = preservedOklch.oklchLightness;
          newColorObj.oklchChroma = preservedOklch.oklchChroma;
          newColorObj.oklchHue = preservedOklch.oklchHue;
          newColorObj.alpha = preservedOklch.alpha;
          newColorObj.oklch = oklchString;
          
          return newColorObj;
        }
      }
      
      // CROSS-MODEL HUE PRESERVATION: Maintain hue consistency during model transitions
      // Problem: Adjusting saturation/lightness can shift hue due to RGB conversion artifacts
      // Why needed: User expects hue to stay constant when only adjusting other properties
      // Solution: Explicitly preserve hue values when not directly adjusting hue sliders
      const hueKeys = ['hue', 'oklchHue'];
      const isNonHueAdjustment = adjustmentKeys.length > 0 && 
        !adjustmentKeys.some(key => hueKeys.includes(key));
      
      // MODEL RELATIONSHIPS: HSL/HSV/HWB share the same hue wheel (0-360°)
      const hslRelatedModels = ['hsl', 'hsv', 'hwb'];
      const isHslRelatedAdjustment = hslRelatedModels.includes(colorObj.model) && 
                                    hslRelatedModels.includes(targetModel);
      
      if (isNonHueAdjustment && (isHslRelatedAdjustment || targetModel === 'rgb' || targetModel === 'hex')) {
        // Create the new color normally
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
          case "oklch":
            str = toString.oklch(updated as OKLCHColor);
            break;
          case "hex":
            str = toString.hex(updated as HEXColor);
            break;
          default:
            throw new Error(`Unsupported color model: ${targetModel}`);
        }
        
        const newColorObj = createColorObject(str, targetModel);
        
        // AGGRESSIVE HUE PRESERVATION: Always preserve hue for HSL-family models
        // Rationale: Small RGB conversion errors can cause noticeable hue shifts
        // Impact: Ensures consistent hue display across all related color model sliders
        if (isHslRelatedAdjustment || targetModel === 'rgb' || targetModel === 'hex') {
          // Lock hue values to prevent drift during color space conversions
          newColorObj.hue = colorObj.hue;
          newColorObj.oklchHue = colorObj.oklchHue;
          
          // REGENERATE COLOR STRINGS: Update all HSL-family representations with locked hue
          const hslColor: HSLColor = { hue: colorObj.hue, saturation: newColorObj.saturation, luminosity: newColorObj.luminosity, alpha: newColorObj.alpha };
          const hsvColor: HSVColor = { hue: colorObj.hue, hsvSaturation: newColorObj.hsvSaturation, value: newColorObj.value, alpha: newColorObj.alpha };
          const hwbColor: HWBColor = { hue: colorObj.hue, whiteness: newColorObj.whiteness, blackness: newColorObj.blackness, alpha: newColorObj.alpha };
          
          newColorObj.hsl = toString.hsl(hslColor);
          newColorObj.hsv = toString.hsv(hsvColor);
          newColorObj.hwb = toString.hwb(hwbColor);
          
          // Also preserve OKLCH hue if we have it
          if (colorObj.oklchHue !== undefined) {
            const oklchColor: OKLCHColor = { oklchLightness: newColorObj.oklchLightness, oklchChroma: newColorObj.oklchChroma, oklchHue: colorObj.oklchHue, alpha: newColorObj.alpha };
            newColorObj.oklch = toString.oklch(oklchColor);
          }
        } else {
          // For non-HSL-related adjustments, only preserve hue if result is achromatic
          // Use same expanded logic as createColorObject
          const resultIsLowSaturation = newColorObj.saturation < 0.1 && newColorObj.hsvSaturation < 0.1;
          const resultIsLowChroma = newColorObj.oklchChroma < 0.02;
          const resultIsFullyBlack = newColorObj.luminosity < 0.1 || newColorObj.value < 0.1 || newColorObj.oklchLightness < 0.01;
          const resultIsFullyWhite = (newColorObj.luminosity > 99.9 && newColorObj.saturation === 0) || 
                                     (newColorObj.whiteness > 99.9) ||
                                     (newColorObj.oklchLightness > 0.99 && newColorObj.oklchChroma < 0.01);
          
          const resultIsAchromatic = resultIsLowSaturation || resultIsLowChroma || resultIsFullyBlack || resultIsFullyWhite;
            
          if (resultIsAchromatic) {
            // Preserve the original hue values to prevent unwanted hue shifts
            newColorObj.hue = colorObj.hue;
            newColorObj.oklchHue = colorObj.oklchHue;
            
            // Regenerate the color strings with preserved hue
            if (targetModel === "hsl" || targetModel === "hsv" || targetModel === "hwb") {
              const hslColor: HSLColor = { hue: colorObj.hue, saturation: newColorObj.saturation, luminosity: newColorObj.luminosity, alpha: newColorObj.alpha };
              const hsvColor: HSVColor = { hue: colorObj.hue, hsvSaturation: newColorObj.hsvSaturation, value: newColorObj.value, alpha: newColorObj.alpha };
              const hwbColor: HWBColor = { hue: colorObj.hue, whiteness: newColorObj.whiteness, blackness: newColorObj.blackness, alpha: newColorObj.alpha };
              
              newColorObj.hsl = toString.hsl(hslColor);
              newColorObj.hsv = toString.hsv(hsvColor);
              newColorObj.hwb = toString.hwb(hwbColor);
            }
            
            if (targetModel === "oklch") {
              const oklchColor: OKLCHColor = { oklchLightness: newColorObj.oklchLightness, oklchChroma: newColorObj.oklchChroma, oklchHue: colorObj.oklchHue, alpha: newColorObj.alpha };
              newColorObj.oklch = toString.oklch(oklchColor);
              newColorObj.oklchHue = colorObj.oklchHue;
            }
          }
        }
        
        return newColorObj;
      }
      
      // STANDARD CASE: Use existing conversion pipeline for cross-model updates
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
        case "oklch":
          str = toString.oklch(updated as OKLCHColor);
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
        case "oklch":
          return toString.oklch(colorObj as OKLCHColor);
        case "hex":
          return toString.hex(colorObj as HEXColor);
        default:
          throw new Error(`Unsupported color model: ${targetModel}`);
      }
    },
  };

  return colorObj;
};
