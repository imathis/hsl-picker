import React from "react";
import { ColorModel } from "../types";
import { colorModelConfig } from "../config/colorModelConfig";
import { useColorSync } from "../hooks/useColorSync";
import { useGradientEffects } from "../hooks/useGradientEffects";
import { ColorModelPicker } from "./ColorModelPicker";
import { ColorSlider } from "./ColorSlider";
import { ColorSwatch } from "./ColorSwatch";
import { CodeInput } from "./Inputs";

/**
 * Main color picker component that orchestrates the color selection interface.
 *
 * Features:
 * - Multiple color model support (HSL, HSV, HWB, RGB, OKLCH)
 * - Real-time gradient updates
 * - Synchronized input controls
 * - Color swatch display with hex input
 */

export const Picker: React.FC = () => {
  // State for controlling which color models are visible
  const [visibleModels, setVisibleModels] = React.useState<
    Record<keyof ColorModel, boolean>
  >({ hsl: true, hwb: false, oklch: false, hsv: false, rgb: false });

  // Custom hooks to handle complex logic
  const { updateInputs, handleSliderChange, handleTextChange } = useColorSync();

  // Set up gradient effects and color synchronization
  useGradientEffects(updateInputs);

  return (
    <div>
      {/* Color model selection controls */}
      <ColorModelPicker
        visibleModels={visibleModels}
        updateInputs={updateInputs}
        setVisibleModels={setVisibleModels}
      />

      <div className="main">
        {/* Color display and hex input */}
        <ColorSwatch onHexChange={handleTextChange} />

        {/* Color model sliders and inputs */}
        <div className="color-pickers">
          {Object.entries(visibleModels).map(
            ([modelKey, isVisible]) =>
              isVisible && (
                <div key={modelKey} className="color-picker">
                  {/* Render sliders for this color model */}
                  {colorModelConfig[modelKey as keyof ColorModel].sliders.map(
                    ({ name, max, step }) => (
                      <ColorSlider
                        key={name}
                        name={name}
                        max={max}
                        step={step}
                        onChange={handleSliderChange}
                        model={modelKey as keyof ColorModel}
                      />
                    ),
                  )}

                  {/* Color format input for this model */}
                  <CodeInput
                    name={modelKey}
                    onChange={([name, value]) => handleTextChange(name, value)}
                    pattern={
                      colorModelConfig[modelKey as keyof ColorModel].pattern
                        .source
                    }
                  />
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  );
};
