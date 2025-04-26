import React from "react";
import { ColorModel, ColorObject } from "../types";

interface ColorModelPickerProps {
  visibleModels: Record<keyof ColorModel, boolean>;
  setVisibleModels: React.Dispatch<
    React.SetStateAction<Record<keyof ColorModel, boolean>>
  >;
  color: ColorObject | null;
  updateInputs: (newColor: ColorObject, fromInput?: string) => void;
}

export const ColorModelPicker: React.FC<ColorModelPickerProps> = ({
  visibleModels,
  setVisibleModels,
  color,
  updateInputs,
}) => {
  const toggleModel = (model: keyof ColorModel) => {
    setVisibleModels((prev) => {
      const newState = { ...prev, [model]: !prev[model] };
      if (!Object.values(newState).some((v) => v)) {
        return { ...newState, [model]: true }; // Ensure at least one model is visible
      }
      return newState;
    });

    // Update sliders and text inputs after toggling visibility
    if (color) {
      window.setTimeout(() => {
        updateInputs(color);
      }, 0);
    }
  };

  return (
    <div className="slider-choices">
      {Object.keys(visibleModels).map((model) => (
        <label key={model}>
          <input
            type="checkbox"
            name={model}
            checked={visibleModels[model as keyof ColorModel]}
            onChange={() => toggleModel(model as keyof ColorModel)}
          />
          <div>{model.toUpperCase()}</div>
        </label>
      ))}
    </div>
  );
};
