import { create } from "zustand";
import { ColorModel, ColorObject } from "../types";
import { updateModelVars, setRootColor } from "../utils/cssUtils";
import { randomColor } from "../utils/randomColor";
import { colorPatterns, colorModels } from "../utils/colorParsing";
import { createColorObject } from "./colorConversion";

interface ColorState {
  color: ColorObject | null;
  setColor: (c: string | ColorObject) => ColorObject | null;
  adjustColor: (args: {
    [key: string]: string;
    model: keyof ColorModel | "hex";
  }) => ColorObject | null;
  colorModels: ColorModel;
}

export const useColorStore = create<ColorState>((set, get) => ({
  color: null,
  colorModels,
  setColor: (c: string | ColorObject): ColorObject | null => {
    const newColor: ColorObject =
      typeof c === "string" ? createColorObject(c) : c;
    if (newColor) {
      updateModelVars({ color: newColor });
      setRootColor(newColor);
      set({ color: newColor });
      // Update URL hash
      window.location.hash = newColor.hex;
      return newColor;
    }
    return null;
  },
  adjustColor: (args: {
    [key: string]: string;
    model: keyof ColorModel | "hex";
  }): ColorObject | null => {
    const { color, setColor } = get();
    if (!color) throw new Error("Color is not initialized");
    const newColor = color.set(args);
    return setColor(newColor);
  },
}));

// Initialize the store with a color on app load
const initializeColor = () => {
  const initialColor = colorPatterns.hex.test(window.location.hash)
    ? window.location.hash
    : randomColor();
  useColorStore.getState().setColor(initialColor);
};

// Call initialization when the store is first accessed
initializeColor();
