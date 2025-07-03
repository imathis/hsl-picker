import { ColorModel } from "../types";
import { useColorStore } from "../utils/colorStore";
import { allColorParts, colorModel } from "../utils/colorParsing";

/**
 * Custom hook that handles synchronization between the color store
 * and DOM input elements. Provides utilities for updating inputs
 * when colors change programmatically.
 */
export const useColorSync = () => {
  const setColor = useColorStore((state) => state.setColor);
  const adjustColor = useColorStore((state) => state.adjustColor);
  const visibleModels = useColorStore((state) => state.visibleModels);
  const setVisibleModels = useColorStore((state) => state.setVisibleModels);

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
   * by parsing and updating the color store. Auto-enables the
   * detected color model picker and preserves OKLCH precision.
   * 
   * Flow: Input component → handleTextChange → detect model → enable picker → setColor
   * 
   * Special case: When users paste cross-format (e.g., OKLCH in HSL input),
   * the Input component passes the original value here, allowing us to:
   * 1. Detect the actual format (OKLCH)
   * 2. Auto-enable the OKLCH picker
   * 3. Preserve wide-gamut precision by passing model to createColorObject
   */
  const handleTextChange = (name: string, value: string) => {
    try {
      // Detect the color model of the pasted/input color
      const detectedModel = colorModel(value);
      
      // Auto-enable the color model picker for the detected format
      if (detectedModel && detectedModel !== 'hex') {
        const modelKey = detectedModel as keyof ColorModel;
        if (!visibleModels[modelKey]) {
          setVisibleModels({ ...visibleModels, [modelKey]: true });
        }
      }
      
      // Set the color with the detected model to preserve precision
      const newColor = setColor(value, detectedModel);
      if (newColor) updateInputs(newColor, name);
    } catch (_error) {
      // Fallback to original behavior if model detection fails
      const newColor = setColor(value);
      if (newColor) updateInputs(newColor, name);
    }
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