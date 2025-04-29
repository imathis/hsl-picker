/**
 * PURPOSE:
 *  To generate graidents for the slider backgrounds in the color picker
 *
 * Note:
 *  These functions rely on css color vars. This way, backgrounds do not have to update when
 *  a new color is chosen, the browser handles recalculating the actual rendered gradients.
 *
 */
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
  trackBg({ type: "rgba", props: [red, green, blue], steps, alpha });

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
  hwb: Record<string, Partial<HwbBgProps>>;
  rgb: Record<string, Partial<RgbBgProps>>;
};

/**
 * Configuration for background gradients.
 */
const backgroundConfig: BackgroundConfig = {
  hsl: {
    hue: { hue: (v: number) => v, steps: 360 },
    saturation: {
      sat: (s: number) => formatPercentage((s / 2) * 100),
      steps: 2,
    },
    luminosity: {
      lig: (l: number) => formatPercentage((l / 3) * 50),
      steps: 3,
    },
    alpha: { alpha: (v: number) => v, steps: 1 },
  },
  hwb: {
    hue: { hue: (v: number) => v, steps: 360 },
    whiteness: {
      whiteness: (v: number) => formatPercentage((v / 2) * 100),
      steps: 2,
    },
    blackness: {
      blackness: (v: number) => formatPercentage((v / 2) * 100),
      steps: 2,
    },
    alpha: { alpha: (v: number) => v, steps: 1 },
  },
  rgb: {
    red: { red: (v: number) => v, steps: 255 },
    green: { green: (v: number) => v, steps: 255 },
    blue: { blue: (v: number) => v, steps: 255 },
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
        (model === "hsl" ? hslBg : model === "hwb" ? hwbBg : rgbBg)(config),
      ]),
    ),
  ]),
);
