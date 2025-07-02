import { ColorModel } from "../types";
import { useColorStore } from "../utils/colorStore";
import { allColorParts } from "../utils/colorParsing";

/**
 * Custom hook that handles synchronization between the color store
 * and DOM input elements. Provides utilities for updating inputs
 * when colors change programmatically.
 */
export const useColorSync = () => {
  const setColor = useColorStore((state) => state.setColor);
  const adjustColor = useColorStore((state) => state.adjustColor);

  /**
   * Updates DOM input elements to reflect the current color values.
   * Avoids updating the input that triggered the change to prevent
   * cursor jumping and infinite update loops.
   * 
   * @param newColor - The color object with all color representations
   * @param fromInput - Name of the input that triggered this update (to skip)
   */
  const updateInputs = (
    newColor: ReturnType<typeof useColorStore.getState>["colorObject"],
    fromInput?: string,
  ) => {
    // Update color format inputs (hsl, rgb, hex, etc.)
    const inputs = {
      hsl: newColor.hsl,
      oklch: newColor.oklch,
      hwb: newColor.hwb,
      hsv: newColor.hsv,
      rgb: newColor.rgb,
      hex: newColor.hex,
    };
    
    Object.entries(inputs)
      .filter(([k]) => k !== fromInput)
      .forEach(([k, v]) => setValue(k, v));

    // Update individual property inputs (hue, saturation, etc.)
    allColorParts.forEach((prop) => {
      setValue(prop, String(newColor[prop]));
      if (`${prop}Num` !== fromInput)
        setValue(`${prop}Num`, String(newColor[prop]));
    });
  };

  /**
   * Handles changes from slider inputs by updating the color store
   * and synchronizing other inputs.
   */
  const handleSliderChange = (
    name: string,
    value: string,
    model: keyof ColorModel | "hex",
  ) => {
    const colorProp = name.replace("Num", "");
    const matchingVal = name.includes("Num") ? colorProp : `${colorProp}Num`;
    setValue(matchingVal, value);
    const newColor = adjustColor({ [colorProp]: value, model });
    if (newColor) updateInputs(newColor, name);
  };

  /**
   * Handles changes from text inputs (color format strings)
   * by parsing and updating the color store.
   */
  const handleTextChange = (name: string, value: string) => {
    const newColor = setColor(value);
    if (newColor) updateInputs(newColor, name);
  };

  return {
    updateInputs,
    handleSliderChange,
    handleTextChange,
  };
};

/**
 * Utility function to set values on DOM input elements by name.
 * Updates all elements matching the given name attribute.
 */
const setValue = (name: string, value: string): void => {
  const elements = document.querySelectorAll<HTMLInputElement>(
    `[name=${name}]`,
  );
  elements.forEach((el) => (el.value = value));
};