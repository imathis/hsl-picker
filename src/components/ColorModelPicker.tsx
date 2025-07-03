import React from "react";
import { ColorModel, ColorObject } from "../types";
import { useColorStore } from "../utils/colorStore";

// Define the display order for color model checkboxes
const MODEL_DISPLAY_ORDER: (keyof ColorModel)[] = [
  "oklch",
  "hwb",
  "hsl",
  "hsv",
  "rgb",
];

interface ColorModelPickerProps {
  visibleModels: Record<keyof ColorModel, boolean>;
  setVisibleModels: (models: Record<keyof ColorModel, boolean>) => void;
  updateInputs: (newColor: ColorObject, fromInput?: string) => void;
}

export const ColorModelPicker: React.FC<ColorModelPickerProps> = ({
  visibleModels,
  setVisibleModels,
  updateInputs,
}) => {
  const color = useColorStore((state) => state.colorObject);
  const toggleModel = (model: keyof ColorModel) => {
    const newState = { ...visibleModels, [model]: !visibleModels[model] };
    // Ensure at least one model is visible
    if (!Object.values(newState).some((v) => v)) {
      newState[model] = true;
    }
    setVisibleModels(newState);

    // Update sliders and text inputs after toggling visibility
    if (color) {
      window.setTimeout(() => {
        updateInputs(color);
      }, 0);
    }
  };

  return (
    <div className="slider-choices">
      {MODEL_DISPLAY_ORDER.map((model) => (
        <label key={model}>
          <input
            type="checkbox"
            name={model}
            checked={visibleModels[model]}
            onChange={() => toggleModel(model)}
          />
          <div>{model.toUpperCase()}</div>
        </label>
      ))}
    </div>
  );
};
