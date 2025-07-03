/**
 * PURPOSE:
 *  To generate graidents for the slider backgrounds in the color picker
 *
 * Note:
 *  These functions rely on css color vars. This way, backgrounds do not have to update when
 *  a new color is chosen, the browser handles recalculating the actual rendered gradients.
 *
 */
import { rgb, oklch, oklab, inGamut } from "culori";

/**
 * Generates an HSV-specific gradient by computing RGB values for each stop.
 * @param currentH - Current hue value (0-360)
 * @param currentS - Current HSV saturation value (0-100)
 * @param currentV - Current HSV value (0-100)
 * @param component - Which HSV component to vary ('hue', 'saturation', 'value')
 * @param steps - Number of gradient steps
 * @returns A CSS linear-gradient string with RGB colors
 */
export const generateHsvGradient = (
  currentH: number,
  currentS: number, 
  currentV: number,
  component: 'hue' | 'saturation' | 'value',
  steps: number = 10
): string => {
  const gradientStops: string[] = [];
  
  for (let i = 0; i <= steps; i++) {
    let h = currentH;
    let s = currentS;
    let v = currentV;
    
    switch (component) {
      case 'hue':
        h = (i / steps) * 360;
        break;
      case 'saturation':
        s = (i / steps) * 100;
        break;
      case 'value':
        v = (i / steps) * 100;
        break;
    }
    
    const hsvColor = { mode: 'hsv' as const, h, s: s / 100, v: v / 100 };
    const rgbColor = rgb(hsvColor);
    if (rgbColor) {
      const r = Math.round(rgbColor.r * 255);
      const g = Math.round(rgbColor.g * 255);
      const b = Math.round(rgbColor.b * 255);
      gradientStops.push(`rgb(${r} ${g} ${b})`);
    }
  }
  
  return `linear-gradient(to right, ${gradientStops.join(', ')})`;
};
/**
 * Props for the trackBg function, which generates a linear gradient background.
 */
interface TrackBgProps {
  type: string;
  steps?: number;
  props: (string | ((v: number) => string | number))[];
  alpha?: string | ((v: number) => string | number) | false;
}

/**
 * Formats a number as a percentage string, rounding to 2 decimal places and removing trailing zeros.
 * @param value - The numeric value to format.
 * @returns A string representing the value as a percentage (e.g., "16.67%").
 */
const formatPercentage = (value: number): string => {
  return `${parseFloat(value.toFixed(2))}%`;
};

/**
 * Generates a linear gradient background string for a given color model.
 * @param type - The color model type (e.g., "hsl", "hwb", "rgba").
 * @param steps - Number of gradient steps to generate (will generate steps + 1 stops, from 0 to steps).
 * @param props - Array of values or functions to compute gradient stops.
 * @param alpha - Alpha value or function for transparency (or false to disable).
 * @returns A CSS linear-gradient string.
 */
export const trackBg = ({
  type,
  steps = 0,
  props,
  alpha = "var(--picker-alpha)",
}: TrackBgProps): string => {
  if (steps <= 0) {
    const vals = props
      .map((prop) => (typeof prop === "function" ? prop(0) : prop))
      .join(" ");
    const stop =
      alpha === false
        ? `${type}(${vals})`
        : `${type}(${vals} / ${typeof alpha === "function" ? alpha(0) : alpha})`;
    return `linear-gradient(to right, ${stop}, ${stop})`;
  }

  const grad: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const vals = props
      .map((prop) => (typeof prop === "function" ? prop(i) : prop))
      .join(" ");
    grad.push(
      alpha === false
        ? `${type}(${vals})`
        : `${type}(${vals} / ${typeof alpha === "function" ? alpha(i) : alpha})`,
    );
  }
  return `linear-gradient(to right, ${grad.join(", ")})`;
};

/**
 * Props for generating an HSL gradient background.
 */
interface HslBgProps {
  hue?: string | ((v: number) => string | number);
  sat?: string | ((v: number) => string | number);
  lig?: string | ((v: number) => string | number);
  steps?: number;
  alpha?: string | ((v: number) => string | number) | false;
}

/**
 * Generates an HSL gradient background.
 * @param hue - Hue value or function (default: CSS variable).
 * @param sat - Saturation value or function (default: CSS variable).
 * @param lig - Lightness value or function (default: CSS variable).
 * @param steps - Number of gradient steps.
 * @param alpha - Alpha value or function (or false to disable).
 * @returns A CSS linear-gradient string for HSL.
 */
export const hslBg = ({
  hue = "var(--picker-hue)",
  sat = "calc(var(--picker-saturation) * 1%)",
  lig = "calc(var(--picker-luminosity) * 1%)",
  steps = 2,
  alpha,
}: HslBgProps): string =>
  trackBg({ type: "hsl", props: [hue, sat, lig], steps, alpha });

/**
 * Generates an HSV gradient background using HSL approximation.
 * Since browsers don't support HSV, we use HSL as a close approximation.
 * @param hue - Hue value or function (default: CSS variable).
 * @param sat - Saturation value or function (default: CSS variable).
 * @param val - Value value or function (default: CSS variable).
 * @param steps - Number of gradient steps.
 * @param alpha - Alpha value or function (or false to disable).
 * @returns A CSS linear-gradient string using HSL approximation.
 */
export const hsvBg = ({
  hue = "var(--picker-hue)",
  sat = "calc(var(--picker-saturation) * 1%)",
  val = "calc(var(--picker-luminosity) * 1%)",
  steps = 2,
  alpha,
}: HsvBgProps): string => {
  // For HSV gradients, we use HSL as an approximation
  // This provides a reasonable visual representation for the sliders
  return trackBg({ type: "hsl", props: [hue, sat, val], steps, alpha });
};

/**
 * Props for generating an HSV gradient background.
 */
interface HsvBgProps {
  hue?: string | ((v: number) => string | number);
  sat?: string | ((v: number) => string | number);
  val?: string | ((v: number) => string | number);
  steps?: number;
  alpha?: string | ((v: number) => string | number) | false;
}

/**
 * Props for generating an HWB gradient background.
 */
interface HwbBgProps {
  hue?: string | ((v: number) => string | number);
  whiteness?: string | ((v: number) => string | number);
  blackness?: string | ((v: number) => string | number);
  steps?: number;
  alpha?: string | ((v: number) => string | number) | false;
}

/**
 * Generates an HWB gradient background.
 * @param hue - Hue value or function (default: CSS variable).
 * @param whiteness - Whiteness value or function (default: CSS variable).
 * @param blackness - Blackness value or function (default: CSS variable).
 * @param steps - Number of gradient steps.
 * @param alpha - Alpha value or function (or false to disable).
 * @returns A CSS linear-gradient string for HWB.
 */
export const hwbBg = ({
  hue = "var(--picker-hue)",
  whiteness = "calc(var(--picker-whiteness) * 1%)",
  blackness = "calc(var(--picker-blackness) * 1%)",
  steps = 2,
  alpha,
}: HwbBgProps): string =>
  trackBg({ type: "hwb", props: [hue, whiteness, blackness], steps, alpha });

/**
 * Props for generating an RGB gradient background.
 */
interface RgbBgProps {
  red?: string | ((v: number) => string | number);
  green?: string | ((v: number) => string | number);
  blue?: string | ((v: number) => string | number);
  steps?: number;
  alpha?: string | ((v: number) => string | number) | false;
}

/**
 * Props for generating an OKLCH gradient background.
 */
interface OklchBgProps {
  lightness?: string | ((v: number) => string | number);
  chroma?: string | ((v: number) => string | number);
  hue?: string | ((v: number) => string | number);
  steps?: number;
  alpha?: string | ((v: number) => string | number) | false;
}

/**
 * Generates an RGB gradient background.
 * @param red - Red value or function (default: CSS variable).
 * @param green - Green value or function (default: CSS variable).
 * @param blue - Blue value or function (default: CSS variable).
 * @param steps - Number of gradient steps (default: 255).
 * @param alpha - Alpha value or function (or false to disable).
 * @returns A CSS linear-gradient string for RGB.
 */
export const rgbBg = ({
  red = "var(--picker-red)",
  green = "var(--picker-green)",
  blue = "var(--picker-blue)",
  steps = 255,
  alpha,
}: RgbBgProps): string =>
  trackBg({ type: alpha === false ? "rgb" : "rgba", props: [red, green, blue], steps, alpha });

/**
 * Generates an OKLCH gradient background.
 * @param lightness - Lightness value or function (default: CSS variable).
 * @param chroma - Chroma value or function (default: CSS variable).
 * @param hue - Hue value or function (default: CSS variable).
 * @param steps - Number of gradient steps (default: 10).
 * @param alpha - Alpha value or function (or false to disable).
 * @returns A CSS linear-gradient string for OKLCH.
 */
export const oklchBg = ({
  lightness = "var(--picker-oklchLightness)",
  chroma = "var(--picker-oklchChroma)",
  hue = "var(--picker-oklchHue)",
  steps = 10,
  alpha,
}: OklchBgProps): string =>
  trackBg({ type: "oklch", props: [lightness, chroma, hue], steps, alpha });

/**
 * Generates OKLCH gradients with two modes:
 * - gamutGaps: false (default) - Smooth gradients, browser handles gamut mapping
 * - gamutGaps: true - Hard cutoffs with black regions for out-of-gamut colors (educational mode)
 * @param currentL - Current lightness value (0-1)
 * @param currentC - Current chroma value (0-0.37)
 * @param currentH - Current hue value (0-360)
 * @param component - Which OKLCH component to vary ('lightness', 'chroma', 'hue')
 * @param steps - Number of gradient steps (more steps = smoother gradients)
 * @param showP3 - Whether to use P3 gamut (true) or sRGB gamut (false) - affects max chroma
 * @param gamutGaps - Whether to show hard cutoffs for out-of-gamut colors (true) or smooth gradients (false)
 * @returns A CSS linear-gradient string
 */
export const generateOklchGradient = (
  currentL: number,
  currentC: number, 
  currentH: number,
  component: 'lightness' | 'chroma' | 'hue',
  steps: number = 50, // Increased for smoother gradients
  showP3: boolean = true,
  gamutGaps: boolean = false
): string => {
  // Constants for OKLCH color space
  const L_MAX = 1.0; // Lightness 0-1
  const C_MAX = showP3 ? 0.37 : 0.32; // P3 has wider gamut than sRGB
  const H_MAX = 360; // Hue 0-360
  
  if (!gamutGaps) {
    // SMOOTH MODE: Generate continuous gradient stops across the full range
    const gradientStops: string[] = [];
    
    if (component === 'lightness') {
      // SPECIAL CASE: Use OKLAB for lightness gradients to maintain hue consistency
      // Convert current OKLCH color to OKLAB for interpolation
      const currentOklch = { mode: 'oklch' as const, l: currentL, c: currentC, h: currentH };
      const currentOklab = oklab(currentOklch);
      
      if (!currentOklab) {
        // Fallback to OKLCH if conversion fails
        for (let i = 0; i <= steps; i++) {
          const l = (i / steps) * L_MAX;
          const colorStop = `oklch(${l.toFixed(3)} ${currentC.toFixed(3)} ${currentH.toFixed(0)})`;
          // Position based on actual lightness value, not step index
          const position = l * 100;
          gradientStops.push(`${colorStop} ${position.toFixed(1)}%`);
        }
      } else {
        // Generate gradient in OKLAB space for better lightness transitions
        for (let i = 0; i <= steps; i++) {
          const lightnessFactor = i / steps; // 0 to 1
          
          // Interpolate in OKLAB space - vary only lightness (L), keep a,b constant
          const oklabColor = {
            mode: 'oklab' as const,
            l: lightnessFactor, // Vary lightness from 0 to 1
            a: currentOklab.a, // Keep a constant for hue consistency
            b: currentOklab.b, // Keep b constant for hue consistency
            alpha: currentOklab.alpha
          };
          
          // Convert back to OKLCH for CSS output
          const outputOklch = oklch(oklabColor);
          if (outputOklch) {
            const colorStop = `oklch(${outputOklch.l.toFixed(3)} ${(outputOklch.c || 0).toFixed(3)} ${(outputOklch.h || currentH).toFixed(0)})`;
            // Position based on actual lightness value, not step index
            const position = lightnessFactor * 100;
            gradientStops.push(`${colorStop} ${position.toFixed(1)}%`);
          }
        }
      }
    } else {
      // STANDARD CASE: Use OKLCH for chroma and hue gradients (these work well)
      for (let i = 0; i <= steps; i++) {
        const l = currentL; // Already in 0-1 scale
        let c = currentC;
        let h = currentH;
        let position: number;
        
        switch (component) {
          case 'chroma':
            // Vary chroma from 0 to max chroma
            c = (i / steps) * C_MAX;
            // Position based on actual chroma value
            position = (c / C_MAX) * 100;
            break;
          case 'hue':
            // Vary hue from 0 to 360 degrees
            h = (i / steps) * H_MAX;
            // Position based on actual hue value
            position = (h / H_MAX) * 100;
            break;
          default:
            position = (i / steps) * 100;
        }
        
        // Ensure hue is valid
        const validHue = isNaN(h) || h === undefined ? 0 : h;
        
        // Create the OKLCH color string - let browser handle gamut mapping
        const colorStop = `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${validHue.toFixed(0)})`;
        
        gradientStops.push(`${colorStop} ${position.toFixed(1)}%`);
      }
    }
    
    return `linear-gradient(to right, ${gradientStops.join(', ')})`;
  } else {
    // HARD CUTOFFS MODE: Show gaps for out-of-gamut colors (educational mode)
    // This mode helps users understand the limits of different color gamuts
    const gradientStops: string[] = [];
    const validColors: { color: string; position: number }[] = [];
    
    // First pass: identify valid colors within the target gamut
    if (component === 'lightness') {
      // SPECIAL CASE: Use OKLAB for lightness gradients to maintain hue consistency
      // OKLCH lightness changes can shift perceived hue, so we interpolate in OKLAB space
      // where lightness changes are more perceptually uniform
      const currentOklch = { mode: 'oklch' as const, l: currentL, c: currentC, h: currentH };
      const currentOklab = oklab(currentOklch);
      
      if (currentOklab) {
        for (let i = 0; i <= steps; i++) {
          const lightnessFactor = i / steps; // 0 to 1
          
          // Interpolate in OKLAB space for perceptually uniform lightness changes
          const oklabColor = {
            mode: 'oklab' as const,
            l: lightnessFactor,
            a: currentOklab.a, // Preserve green-red axis
            b: currentOklab.b, // Preserve blue-yellow axis
            alpha: currentOklab.alpha
          };
          
          // Convert back to OKLCH for gamut checking
          const outputOklch = oklch(oklabColor);
          if (outputOklch) {
            const oklchColorForGamut = {
              mode: 'oklch' as const,
              l: outputOklch.l,
              c: outputOklch.c || 0,
              h: outputOklch.h || currentH
            };
            
            // Check if color is in gamut (sRGB OR P3 when showP3 is true)
            const isInGamut = showP3 
              ? (inGamut('rgb')(oklchColorForGamut) || inGamut('p3')(oklchColorForGamut))
              : inGamut('rgb')(oklchColorForGamut);
            // CRITICAL: Position must align with slider handle calculation
            // Slider calculates: ((value - 0) / (1 - 0)) * 100 = value * 100
            const position = lightnessFactor * 100;
            
            if (isInGamut) {
              const colorStop = `oklch(${outputOklch.l.toFixed(3)} ${(outputOklch.c || 0).toFixed(3)} ${(outputOklch.h || currentH).toFixed(0)})`;
              validColors.push({ color: colorStop, position });
            }
          }
        }
      } else {
        // Fallback to standard OKLCH approach if OKLAB conversion fails
        for (let i = 0; i <= steps; i++) {
          const l = (i / steps) * 1.0;
          const oklchColorForGamut = { 
            mode: 'oklch' as const, 
            l: l, 
            c: Math.max(0, currentC), 
            h: currentH 
          };
          
          // Check if color is in gamut (sRGB OR P3 when showP3 is true)
          const isInGamut = showP3 
            ? (inGamut('rgb')(oklchColorForGamut) || inGamut('p3')(oklchColorForGamut))
            : inGamut('rgb')(oklchColorForGamut);
          // CRITICAL: Position must align with slider handle calculation
          // Both use (value / max) * 100 for consistent visual alignment
          const position = l * 100;
          
          if (isInGamut) {
            const colorStop = `oklch(${l.toFixed(3)} ${currentC.toFixed(3)} ${currentH.toFixed(0)})`;
            validColors.push({ color: colorStop, position });
          }
        }
      }
    } else {
      // STANDARD CASE: Use OKLCH for chroma and hue gradients  
      for (let i = 0; i <= steps; i++) {
        const l = currentL;
        let c = currentC;
        let h = currentH;
        let position: number;
        
        switch (component) {
          case 'chroma':
            c = (i / steps) * C_MAX;
            // CRITICAL: Position must match slider handle positioning
            // Both use (value / max) * 100 to ensure gaps align with handles
            position = (c / C_MAX) * 100;
            break;
          case 'hue':
            h = (i / steps) * H_MAX;
            // CRITICAL: Position must match slider handle positioning
            // Both use (value / max) * 100 to ensure gaps align with handles
            position = (h / H_MAX) * 100;
            break;
          default:
            position = (i / steps) * 100;
        }
        
        // Ensure hue is valid
        const validHue = isNaN(h) || h === undefined ? 0 : h;
        
        // Create OKLCH color for gamut checking (culori uses 0-1 for lightness)
        const oklchColorForGamut = { 
          mode: 'oklch' as const, 
          l: l, 
          c: Math.max(0, c), 
          h: validHue 
        };
        
        // Check if color is in gamut (sRGB OR P3 when showP3 is true)
        const isInGamut = showP3 
          ? (inGamut('rgb')(oklchColorForGamut) || inGamut('p3')(oklchColorForGamut))
          : inGamut('rgb')(oklchColorForGamut);
        
        if (isInGamut) {
          const colorStop = `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${validHue.toFixed(0)})`;
          validColors.push({ color: colorStop, position });
        }
      }
    }
    
    // Second pass: create gradient with hard cutoffs
    if (validColors.length === 0) {
      return 'linear-gradient(to right, oklch(0.2 0 0))';
    }
    
    // Build gradient with explicit positions and hard cutoffs for gaps
    for (let i = 0; i < validColors.length; i++) {
      const { color, position } = validColors[i];
      
      // Add black at the start if first valid color isn't at 0%
      if (i === 0 && position > 0) {
        gradientStops.push('oklch(0.2 0 0) 0%');
        gradientStops.push(`oklch(0.2 0 0) ${position.toFixed(1)}%`);
      }
      
      gradientStops.push(`${color} ${position.toFixed(1)}%`);
      
      // Check for gaps to next valid color
      if (i < validColors.length - 1) {
        const nextPosition = validColors[i + 1].position;
        const gap = nextPosition - position;
        const stepSize = 100 / steps;
        
        // If there's a gap of more than 1.5 steps, add hard cutoff
        if (gap > stepSize * 1.5) {
          gradientStops.push(`${color} ${(position + 0.1).toFixed(1)}%`);
          gradientStops.push(`oklch(0.2 0 0) ${(position + 0.1).toFixed(1)}%`);
          gradientStops.push(`oklch(0.2 0 0) ${(nextPosition - 0.1).toFixed(1)}%`);
        }
      } else {
        // Last valid color - add black to end if not at 100%
        if (position < 100) {
          gradientStops.push(`${color} ${(position + 0.1).toFixed(1)}%`);
          gradientStops.push(`oklch(0.2 0 0) ${(position + 0.1).toFixed(1)}%`);
          gradientStops.push('oklch(0.2 0 0) 100%');
        }
      }
    }
    
    return `linear-gradient(to right, ${gradientStops.join(', ')})`;
  }
};

/**
 * Generates a rainbow gradient background for the hue slider.
 * @returns A CSS linear-gradient string representing a rainbow.
 */
export const rainbowBg = (): string =>
  hslBg({
    hue: (v: number) => v * 36,
    sat: "calc(clamp(35, var(--picker-saturation), 60) * 1%)",
    lig: "calc(clamp(55, var(--picker-luminosity), 70) * 1%)",
    steps: 10,
    alpha: false,
  });

/**
 * Interface for the background model.
 */
export interface BackgroundModel {
  [key: string]: {
    [key: string]: string;
  };
}

/**
 * Types for background configuration.
 */
type BackgroundConfig = {
  hsl: Record<string, Partial<HslBgProps>>;
  hsv: Record<string, Partial<HsvBgProps>>;
  hwb: Record<string, Partial<HwbBgProps>>;
  rgb: Record<string, Partial<RgbBgProps>>;
  oklch: Record<string, Partial<OklchBgProps>>;
};

/**
 * Configuration for background gradients.
 */
const backgroundConfig: BackgroundConfig = {
  hsl: {
    hue: { hue: (v: number) => v, steps: 360, alpha: false },
    saturation: {
      sat: (s: number) => formatPercentage((s / 2) * 100),
      steps: 2,
      alpha: false,
    },
    luminosity: {
      lig: (l: number) => formatPercentage((l / 10) * 100),
      steps: 10,
      alpha: false,
    },
    alpha: { alpha: (v: number) => v, steps: 1 },
  },
  hsv: {
    hue: "var(--picker-hsv-hue-gradient)",
    hsvSaturation: "var(--picker-hsv-saturation-gradient)",
    value: "var(--picker-hsv-value-gradient)",
    alpha: { alpha: (v: number) => v, steps: 1 },
  },
  hwb: {
    hue: { hue: (v: number) => v, steps: 360, alpha: false },
    whiteness: {
      whiteness: (v: number) => formatPercentage((v / 2) * 100),
      steps: 2,
      alpha: false,
    },
    blackness: {
      blackness: (v: number) => formatPercentage((v / 2) * 100),
      steps: 2,
      alpha: false,
    },
    alpha: { alpha: (v: number) => v, steps: 1 },
  },
  rgb: {
    red: { red: (v: number) => v, steps: 255, alpha: false },
    green: { green: (v: number) => v, steps: 255, alpha: false },
    blue: { blue: (v: number) => v, steps: 255, alpha: false },
    alpha: { alpha: (v: number) => v, steps: 1 },
  },
  oklch: {
    oklchLightness: "var(--picker-oklch-lightness-gradient)",
    oklchChroma: "var(--picker-oklch-chroma-gradient)",
    oklchHue: "var(--picker-oklch-hue-gradient)",
    alpha: { alpha: (v: number) => v, steps: 1 },
  },
};

/**
 * Precomputed gradient backgrounds for each color model.
 */
export const background: BackgroundModel = Object.fromEntries(
  Object.entries(backgroundConfig).map(([model, props]) => [
    model,
    Object.fromEntries(
      Object.entries(props).map(([key, config]) => [
        key,
        // For HSV, use the CSS variable directly if it's a string
        typeof config === "string" ? config :
        (model === "hsl" ? hslBg : 
         model === "hsv" ? hsvBg : 
         model === "hwb" ? hwbBg : 
         model === "oklch" ? oklchBg :
         rgbBg)(config),
      ]),
    ),
  ]),
);
