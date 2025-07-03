import { ColorModel } from "../types";
import { colorPatterns } from "../utils/colorParsing";

/**
 * Configuration for color model sliders and validation patterns.
 * 
 * Each color model defines:
 * - sliders: Array of slider configurations with name, max value, and step size
 * - pattern: Regular expression for validating color strings in this format
 * 
 * Slider configurations:
 * - name: Property name in the color store (e.g., "hue", "saturation")
 * - max: Maximum value for the slider (defaults to 100 for percentages)
 * - step: Step size for precise control (smaller values = finer control)
 */
export const colorModelConfig: Record<
  keyof ColorModel,
  { sliders: { name: string; max?: number; step?: number }[]; pattern: RegExp }
> = {
  hsl: {
    sliders: [
      { name: "hue", max: 360, step: 1 }, // Degrees (0-360)
      { name: "saturation", step: 0.1 }, // Percentage (0-100)
      { name: "luminosity", step: 0.1 }, // Percentage (0-100)
      { name: "alpha", max: 1, step: 0.01 }, // Decimal (0-1)
    ],
    pattern: colorPatterns.hsl,
  },
  hsv: {
    sliders: [
      { name: "hue", max: 360, step: 1 }, // Degrees (0-360)
      { name: "hsvSaturation", step: 0.1 }, // Percentage (0-100)
      { name: "value", step: 0.1 }, // Percentage (0-100)
      { name: "alpha", max: 1, step: 0.01 }, // Decimal (0-1)
    ],
    pattern: colorPatterns.hsv,
  },
  hwb: {
    sliders: [
      { name: "hue", max: 360, step: 1 }, // Degrees (0-360)
      { name: "whiteness", step: 0.1 }, // Percentage (0-100)
      { name: "blackness", step: 0.1 }, // Percentage (0-100)
      { name: "alpha", max: 1, step: 0.01 }, // Decimal (0-1)
    ],
    pattern: colorPatterns.hwb,
  },
  rgb: {
    sliders: [
      { name: "red", max: 255 }, // Integer (0-255)
      { name: "green", max: 255 }, // Integer (0-255)
      { name: "blue", max: 255 }, // Integer (0-255)
      { name: "alpha", max: 1, step: 0.01 }, // Decimal (0-1)
    ],
    pattern: colorPatterns.rgb,
  },
  oklch: {
    sliders: [
      { name: "oklchLightness", max: 1, step: 0.001 }, // Decimal (0-1)
      { name: "oklchChroma", max: 0.37, step: 0.001 }, // Decimal (0-0.37 typical)
      { name: "oklchHue", max: 360, step: 0.001 }, // Degrees (0-360, 3 decimal places)
      { name: "alpha", max: 1, step: 0.01 }, // Decimal (0-1)
    ],
    pattern: colorPatterns.oklch,
  },
};