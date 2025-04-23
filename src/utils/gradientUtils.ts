/**
 * Props for the trackBg function, which generates a linear gradient background.
 */
interface TrackBgProps {
  type?: string;
  steps?: number;
  props?: (string | ((v: number) => string | number))[];
  alpha?: string | ((v: number) => string | number) | false;
}

/**
 * Generates a linear gradient background string for a given color model.
 * @param type - The color model type (e.g., "hsl", "hwb", "rgba").
 * @param steps - Number of gradient steps to generate.
 * @param props - Array of values or functions to compute gradient stops.
 * @param alpha - Alpha value or function for transparency (or false to disable).
 * @returns A CSS linear-gradient string.
 */
export const trackBg = ({
  type = "",
  steps = 0,
  props = [],
  alpha = "var(--picker-alpha)",
}: TrackBgProps): string => {
  const grad: string[] = [];
  // Helper to evaluate a prop value, either as a static string or a function of the step index
  const propVal = (
    prop: string | ((v: number) => string | number),
    i: number,
  ): string | number => (typeof prop === "function" ? prop(i) : prop);

  // Generate gradient stops by evaluating props at each step
  for (let i = 0; i < steps; i += 1) {
    const vals = props.map((val) => propVal(val, i)).join(" ");
    if (alpha !== false) {
      grad.push(`${type}(${vals} / ${propVal(alpha, i)})`);
    } else {
      grad.push(`${type}(${vals})`);
    }
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
  ...props
}: HslBgProps): string =>
  trackBg({ type: "hsl", props: [hue, sat, lig], ...props });

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
  ...props
}: HwbBgProps): string =>
  trackBg({ type: "hwb", props: [hue, whiteness, blackness], ...props });

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
  ...props
}: RgbBgProps): string =>
  trackBg({ type: "rgba", props: [red, green, blue], steps, ...props });

/**
 * Generates a rainbow gradient background for the hue slider.
 * @returns A CSS linear-gradient string representing a rainbow.
 */
export const rainbowBg = (): string => {
  const hue = (v: number): number => v * 36; // Map 0-9 steps to 0-360 degrees
  const sat = "calc(clamp(35, var(--picker-saturation), 60) * 1%)"; // Clamp saturation for visibility
  const lig = "calc(clamp(55, var(--picker-luminosity), 70) * 1%)"; // Clamp lightness for visibility
  return trackBg({
    type: "hsl",
    props: [hue, sat, lig],
    steps: 10,
    alpha: false,
  });
};

/**
 * Interface for the background model, mapping color models to their gradient properties.
 */
export interface BackgroundModel {
  [key: string]: {
    [key: string]: string;
  };
}

/**
 * Precomputed gradient backgrounds for each color model property.
 * Used to style the sliders in the Picker component.
 */
export const background: BackgroundModel = {
  hsl: {
    hue: hslBg({ hue: (v: number): number => v, steps: 360 }), // Full hue range (0-360)
    saturation: hslBg({
      sat: (s: number): string => (s ? "100%" : "0%"),
      steps: 2,
    }), // On/off saturation
    luminosity: hslBg({ lig: (l: number): string => `${l * 50}%`, steps: 3 }), // Lightness steps (0%, 50%, 100%)
    alpha: hslBg({ alpha: (v: number): number => v, steps: 2 }), // Alpha range (0-1)
  },
  hwb: {
    hue: hwbBg({ hue: (v: number): number => v, steps: 360 }), // Full hue range (0-360)
    whiteness: hwbBg({
      whiteness: (v: number): string => `${v * 100}%`,
      steps: 2,
    }), // Whiteness range (0%-100%)
    blackness: hwbBg({
      blackness: (v: number): string => `${v * 100}%`,
      steps: 2,
    }), // Blackness range (0%-100%)
    alpha: hwbBg({ alpha: (v: number): number => v, steps: 2 }), // Alpha range (0-1)
  },
  rgb: {
    red: rgbBg({ red: (v: number): number => v }), // Red range (0-255)
    green: rgbBg({ green: (v: number): number => v }), // Green range (0-255)
    blue: rgbBg({ blue: (v: number): number => v }), // Blue range (0-255)
    alpha: rgbBg({ alpha: (v: number): number => v, steps: 2 }), // Alpha range (0-1)
  },
};
