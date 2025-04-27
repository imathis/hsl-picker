import { create } from "zustand";
import { ColorModel, ColorObject } from "../types";
import { createColorObject } from "../utils/colorConversion";
import { colorModels, colorPatterns } from "../utils/colorParsing";
import { randomHsl } from "../utils/randomColor";
import { updateUiColor } from "./uiUtils";

export interface ColorState {
  hue: number;
  saturation: number;
  luminosity: number;
  whiteness: number;
  blackness: number;
  red: number;
  green: number;
  blue: number;
  alpha: number;
  hex: string;
  model: keyof ColorModel | "hex";
  colorObject: ColorObject; // Add ColorObject to the state
  setColor: (c: string | ColorObject) => ColorObject;
  adjustColor: (args: {
    [key: string]: string;
    model: keyof ColorModel | "hex";
  }) => ColorObject;
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
    whiteness: 0,
    blackness: 0,
    red: 0,
    green: 0,
    blue: 0,
    alpha: 1,
    hex: "#c0ff33",
    model: "rgb",
    colorObject: initialColorObject, // Initialize colorObject
    colorModels,
    setColor: (c: string | ColorObject) => {
      const newColor: ColorObject =
        typeof c === "string" ? createColorObject(c) : c;
      set({
        hue: newColor.hue,
        saturation: newColor.saturation,
        luminosity: newColor.luminosity,
        whiteness: newColor.whiteness,
        blackness: newColor.blackness,
        red: newColor.red,
        green: newColor.green,
        blue: newColor.blue,
        alpha: newColor.alpha,
        hex: newColor.hex,
        model: newColor.model,
        colorObject: newColor, // Store the ColorObject
      });
      updateUiColor(newColor);
      return newColor;
    },
    adjustColor: (args: {
      [key: string]: string;
      model: keyof ColorModel | "hex";
    }) => {
      const currentColor = get().colorObject; // Use the stored ColorObject
      const newColor = currentColor.set(args);
      set({
        hue: newColor.hue,
        saturation: newColor.saturation,
        luminosity: newColor.luminosity,
        whiteness: newColor.whiteness,
        blackness: newColor.blackness,
        red: newColor.red,
        green: newColor.green,
        blue: newColor.blue,
        alpha: newColor.alpha,
        hex: newColor.hex,
        model: newColor.model,
        colorObject: newColor, // Update the ColorObject
      });
      updateUiColor(newColor);
      return newColor;
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

initializeColor();
