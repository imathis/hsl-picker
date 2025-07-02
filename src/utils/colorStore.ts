import { create } from "zustand/react";
import { ColorModel, ColorObject } from "../types";
import { createColorObject } from "../utils/colorConversion";
import { colorModels, colorPatterns } from "../utils/colorParsing";
import { randomHsl } from "../utils/randomColor";
import { updateUiColor } from "./uiUtils";

export interface ColorState {
  hue: number;
  saturation: number;
  luminosity: number;
  hsvSaturation: number;
  value: number;
  whiteness: number;
  blackness: number;
  red: number;
  green: number;
  blue: number;
  oklchLightness: number;
  oklchChroma: number;
  oklchHue: number;
  alpha: number;
  hex: string;
  model: keyof ColorModel | "hex";
  showP3: boolean; // Toggle for P3 vs sRGB gamut display
  gamutGaps: boolean; // Toggle for gradient behavior: false = smooth (browser fallback), true = hard cutoffs
  colorObject: ColorObject; // Add ColorObject to the state
  setColor: (c: string | ColorObject) => ColorObject;
  adjustColor: (args: {
    [key: string]: string;
    model: keyof ColorModel | "hex";
  }) => ColorObject;
  setShowP3: (showP3: boolean) => void;
  setGamutGaps: (gamutGaps: boolean) => void;
  colorModels: ColorModel;
  getColorObject: () => ColorObject;
}

export const useColorStore = create<ColorState>((set, get) => {
  // Initialize with a default ColorObject
  const initialColorObject = createColorObject("#c0ff33");

  return {
    hue: 0,
    saturation: 0,
    luminosity: 0,
    hsvSaturation: 0,
    value: 0,
    whiteness: 0,
    blackness: 0,
    red: 0,
    green: 0,
    blue: 0,
    oklchLightness: 0,
    oklchChroma: 0,
    oklchHue: 0,
    alpha: 1,
    hex: "#c0ff33",
    model: "rgb",
    showP3: true, // Default to showing P3 gamut
    gamutGaps: true, // Default to smooth gradients (browser fallback)
    colorObject: initialColorObject, // Initialize colorObject
    colorModels,
    setColor: (c: string | ColorObject) => {
      const newColor: ColorObject =
        typeof c === "string" ? createColorObject(c) : c;
      set({
        hue: newColor.hue,
        saturation: newColor.saturation,
        luminosity: newColor.luminosity,
        hsvSaturation: newColor.hsvSaturation,
        value: newColor.value,
        whiteness: newColor.whiteness,
        blackness: newColor.blackness,
        red: newColor.red,
        green: newColor.green,
        blue: newColor.blue,
        oklchLightness: newColor.oklchLightness,
        oklchChroma: newColor.oklchChroma,
        oklchHue: newColor.oklchHue,
        alpha: newColor.alpha,
        hex: newColor.hex,
        model: newColor.model,
        colorObject: newColor, // Store the ColorObject
      });
      updateUiColor(newColor, get().showP3, get().gamutGaps);
      return newColor;
    },
    adjustColor: (args: {
      [key: string]: string;
      model: keyof ColorModel | "hex";
    }) => {
      const currentColor = get().colorObject; // Use the stored ColorObject

      // Convert string values to numbers for numeric properties
      const numericArgs: { [key: string]: string | number } = {};
      Object.entries(args).forEach(([key, value]) => {
        if (key === "model") {
          numericArgs[key] = value;
        } else {
          // Convert to number if it's a numeric property
          const numValue = parseFloat(value);
          numericArgs[key] = isNaN(numValue) ? value : numValue;
        }
      });

      const newColor = currentColor.set(
        numericArgs as Partial<ColorParts> & {
          model?: keyof ColorModel | "hex";
        },
      );
      set({
        hue: newColor.hue,
        saturation: newColor.saturation,
        luminosity: newColor.luminosity,
        hsvSaturation: newColor.hsvSaturation,
        value: newColor.value,
        whiteness: newColor.whiteness,
        blackness: newColor.blackness,
        red: newColor.red,
        green: newColor.green,
        blue: newColor.blue,
        oklchLightness: newColor.oklchLightness,
        oklchChroma: newColor.oklchChroma,
        oklchHue: newColor.oklchHue,
        alpha: newColor.alpha,
        hex: newColor.hex,
        model: newColor.model,
        colorObject: newColor, // Update the ColorObject
      });
      updateUiColor(newColor, get().showP3, get().gamutGaps);
      return newColor;
    },
    setShowP3: (showP3: boolean) => {
      set({ showP3 });
      // Trigger gradient regeneration by updating UI
      const currentColor = get().colorObject;
      updateUiColor(currentColor, showP3, get().gamutGaps);
    },
    setGamutGaps: (gamutGaps: boolean) => {
      set({ gamutGaps });
      // Trigger gradient regeneration by updating UI
      const currentColor = get().colorObject;
      updateUiColor(currentColor, get().showP3, gamutGaps);
    },
    getColorObject: () => {
      return get().colorObject; // Simply return the stored ColorObject
    },
  };
});

// Initialize the store with a color on app load
const initializeColor = () => {
  const initialColor = colorPatterns.hex.test(window.location.hash)
    ? window.location.hash
    : randomHsl();
  useColorStore.getState().setColor(initialColor);
};

// Initialize after DOM is ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeColor);
  } else {
    initializeColor();
  }
}
