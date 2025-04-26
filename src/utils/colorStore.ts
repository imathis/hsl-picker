import { create } from "zustand";
import {
  ColorModel,
  ColorObject,
  ColorParts,
  HSLColor,
  HWBColor,
  RGBColor,
} from "../types";
import { updateModelVars, setRootColor } from "../utils/cssUtils";
import { randomColor } from "../utils/randomColor";
import { colorPatterns, colorModels } from "../utils/colorParsing";
import { createColorObject, toString } from "../utils/colorConversion";

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
  model: keyof ColorModel | "hex";
  setColor: (c: string | ColorObject) => void;
  adjustColor: (args: {
    [key: string]: string;
    model: keyof ColorModel | "hex";
  }) => void;
  colorModels: ColorModel;
  getColorObject: () => ColorObject;
}

export const useColorStore = create<ColorState>((set, get) => {
  const updateCssAndUrl = (color: ColorObject) => {
    updateModelVars({ color });
    setRootColor(color);
    window.location.hash = color.hex;
  };

  const createColorObjectFromState = (): ColorObject => {
    const state = get();
    const rgb = toString.rgb({
      red: state.red,
      green: state.green,
      blue: state.blue,
      alpha: state.alpha,
    });
    const hsl = toString.hsl({
      hue: state.hue,
      saturation: state.saturation,
      luminosity: state.luminosity,
      alpha: state.alpha,
    });
    const hwb = toString.hwb({
      hue: state.hue,
      whiteness: state.whiteness,
      blackness: state.blackness,
      alpha: state.alpha,
    });
    const hex = createColorObject(rgb).hex;

    // Determine the string representation based on the current model
    const modelString =
      state.model === "hex"
        ? hex
        : state.model === "hsl"
          ? hsl
          : state.model === "hwb"
            ? hwb
            : rgb;

    return {
      model: state.model,
      hue: state.hue,
      saturation: state.saturation,
      luminosity: state.luminosity,
      whiteness: state.whiteness,
      blackness: state.blackness,
      red: state.red,
      green: state.green,
      blue: state.blue,
      alpha: state.alpha,
      hex,
      hsl,
      hwb,
      rgb,
      [state.model]: modelString,
      set: ({
        model: setModel,
        ...adj
      }: Partial<ColorParts> & { model?: keyof ColorModel | "hex" }) => {
        const updated: ColorParts = { ...state, ...adj };
        let str: string;
        const targetModel = setModel ?? state.model;
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
            str = createColorObject(toString.rgb(updated as RGBColor)).hex;
            break;
          default:
            throw new Error(`Unsupported color model: ${targetModel}`);
        }
        const newColor = createColorObject(str, targetModel);
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
          model: targetModel,
        });
        updateCssAndUrl(newColor);
        return newColor;
      },
      toString: (targetModel?: keyof ColorModel | "hex") => {
        if (!targetModel) {
          const currentState = get();
          return currentState[targetModel ?? currentState.model];
        }
        const updated: ColorParts = { ...get() };
        switch (targetModel) {
          case "hsl":
            return toString.hsl(updated as HSLColor);
          case "hwb":
            return toString.hwb(updated as HWBColor);
          case "rgb":
            return toString.rgb(updated as RGBColor);
          case "hex":
            return createColorObject(toString.rgb(updated as RGBColor)).hex;
          default:
            throw new Error(`Unsupported color model: ${targetModel}`);
        }
      },
    };
  };

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
    model: "rgb",
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
        model: newColor.model,
      });
      updateCssAndUrl(newColor);
    },
    adjustColor: (args: {
      [key: string]: string;
      model: keyof ColorModel | "hex";
    }) => {
      const color = createColorObjectFromState();
      const newColor = color.set(args);
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
        model: newColor.model,
      });
      updateCssAndUrl(newColor);
    },
    getColorObject: () => createColorObjectFromState(),
  };
});

// Initialize the store with a color on app load
const initializeColor = () => {
  const initialColor = colorPatterns.hex.test(window.location.hash)
    ? window.location.hash
    : randomColor();
  useColorStore.getState().setColor(initialColor);
};

initializeColor();
