import React from "react";
import { useColor } from "../hooks";
import { ColorModel, ColorObject } from "../types";
import { allColorParts, colorPatterns } from "../utils/colorParsing";
import { setRoot } from "../utils/cssUtils";
import { background, rainbowBg } from "../utils/gradientUtils";
import { CodeInput, Input } from "./Inputs";

/**
 * Updates the value of all input elements with the given name.
 * @param name - The name attribute of the input elements to update.
 * @param value - The new value to set for the input elements.
 */
const setValue = (name: string, value: string): void => {
  const elements = document.querySelectorAll<HTMLInputElement>(
    `[name=${name}]`,
  );
  elements.forEach((el) => {
    el.value = value;
  });
};

/**
 * Props for the ColorSlider component.
 */
interface ColorSliderProps {
  name: string;
  model: keyof ColorModel | "hex";
  onChange: ([name, value, model]: [
    string,
    string,
    keyof ColorModel | "hex",
  ]) => void;
  max?: number | string;
  step?: number | string;
  min?: number | string;
  style?: React.CSSProperties;
}

/**
 * A slider component for adjusting a specific color property (e.g., hue, saturation).
 * @param name - The name of the color property (e.g., "hue", "saturation").
 * @param model - The color model ("hsl", "hwb", "rgb", or "hex").
 * @param onChange - Callback to handle changes to the slider value.
 * @param max - Maximum value for the slider.
 * @param min - Minimum value for the slider.
 * @param step - Step increment for the slider.
 * @param style - Additional CSS styles for the slider.
 */
const ColorSlider: React.FC<ColorSliderProps> = ({
  name,
  model,
  onChange,
  ...props
}) => {
  const onChangeHandler = ([name, value]: [string, string]): void => {
    onChange([name, value, model]);
  };

  return (
    <div className="color-slider">
      <div className="slider-track">
        <Input
          type="range"
          data-model={model}
          name={name}
          min={0}
          max={100}
          step={1}
          onChange={onChangeHandler}
          {...props}
          style={{ background: background[model][name], ...props.style }}
        />
      </div>
      <Input
        type="number"
        data-model={model}
        name={`${name}Num`} // Suffix "Num" to differentiate from range input
        min={0}
        max={100}
        step={0.1}
        onChange={onChangeHandler}
        {...props}
      />
    </div>
  );
};

/**
 * The main color picker component, allowing users to adjust colors in HSL, HWB, and RGB models.
 * Displays sliders for each color model and text inputs for direct color code entry.
 */
export const Picker: React.FC = () => {
  const { color, adjustColor, setColor } = useColor();
  const model = React.useRef<string | null>(null); // Tracks the initial color model
  const swatch = React.useRef<HTMLDivElement>(null); // Reference to the color swatch
  const [showHsl, setShowHsl] = React.useState<boolean>(true); // Toggle HSL sliders
  const [showHwb, setShowHwb] = React.useState<boolean>(false); // Toggle HWB sliders
  const [showRgb, setShowRgb] = React.useState<boolean>(false); // Toggle RGB sliders

  // Updates the text inputs with the current color values
  const updateText = React.useCallback(
    ({
      newColor,
      fromInput,
    }: {
      newColor: ColorObject;
      fromInput?: string;
    }): void => {
      const inputs = {
        hsl: newColor.hsl,
        hwb: newColor.hwb,
        rgb: newColor.rgb,
        hex: newColor.hex,
      };
      // Update all inputs except the one that triggered the change
      Object.entries(inputs)
        .filter(([k]) => k !== fromInput)
        .forEach(([k, v]) => {
          setValue(k, v);
        });
    },
    [],
  );

  // Updates the sliders with the current color values
  const updateSliders = React.useCallback(
    ({
      newColor,
      fromInput,
    }: {
      newColor: ColorObject;
      fromInput?: string;
    }): void => {
      // Update all slider inputs and their corresponding number inputs
      allColorParts.forEach((prop) => {
        setValue(prop, String(newColor[prop]));
        if (`${prop}Num` !== fromInput)
          setValue(`${prop}Num`, String(newColor[prop]));
      });
    },
    [],
  );

  // Handles changes to slider inputs
  const setSliderInput = React.useCallback(
    ([name, value, model]: [
      string,
      string,
      keyof ColorModel | "hex",
    ]): void => {
      const colorProp = name.replace("Num", ""); // Normalize name (e.g., "hueNum" -> "hue")
      const matchingVal = name.includes("Num") ? colorProp : `${name}Num`; // Corresponding input
      setValue(matchingVal, value); // Sync the paired input
      const newColor = adjustColor({ [colorProp]: value, model }); // Adjust the color
      if (newColor) {
        updateText({ newColor });
        updateSliders({ newColor, fromInput: name });
      }
    },
    [updateText, updateSliders, adjustColor],
  );

  // Handles changes to text inputs
  const onChangeText = React.useCallback(
    ([name, value]: [string, string]): void => {
      const newColor = setColor(value); // Set the new color
      if (newColor) {
        updateText({ newColor, fromInput: name });
        updateSliders({ newColor });
      }
    },
    [setColor, updateText, updateSliders],
  );

  // Toggles visibility of sliders for a specific color model
  const showSlider = (name: string) => (): void => {
    let showFunction: React.Dispatch<React.SetStateAction<boolean>>;
    if (name === "hsl") showFunction = setShowHsl;
    else if (name === "hwb") showFunction = setShowHwb;
    else if (name === "rgb") showFunction = setShowRgb;
    else return;

    // Toggle visibility, ensuring at least one model is visible
    showFunction((showing) => {
      if (!showing) return true;
      if ([showHsl, showRgb, showHwb].filter((v) => v).length > 1) {
        return false;
      }
      return true;
    });

    // Update sliders and text inputs after toggle
    window.setTimeout(() => {
      if (color) {
        updateSliders({ newColor: color });
        updateText({ newColor: color });
      }
    }, 0);
  };

  // Initialize sliders, text inputs, and CSS variables on first render
  React.useEffect(() => {
    if (color && !model.current) {
      updateSliders({ newColor: color });
      updateText({ newColor: color });
      model.current = color.model;
      setRoot("rainbow", rainbowBg());
    }
  }, [color, updateText, updateSliders]);

  if (!color) return null;

  return (
    <div>
      <div className="slider-choices">
        <label>
          <input
            type="checkbox"
            name="hsl"
            checked={showHsl}
            onChange={showSlider("hsl")}
          />
          <div>HSL</div>
        </label>
        <label>
          <input
            type="checkbox"
            name="hwb"
            checked={showHwb}
            onChange={showSlider("hwb")}
          />
          <div>HWB</div>
        </label>
        <label>
          <input
            type="checkbox"
            name="rgb"
            checked={showRgb}
            onChange={showSlider("rgb")}
          />
          <div>RGB</div>
        </label>
      </div>
      <div className="main">
        <div className="color-swatch-wrapper">
          <div className="color-swatch" ref={swatch} />
          <CodeInput
            name="hex"
            onChange={onChangeText}
            pattern={colorPatterns.hex.source}
          />
        </div>
        <div className="color-pickers">
          {showHsl ? (
            <div className="color-picker">
              <ColorSlider
                name="hue"
                max={360}
                step={1}
                onChange={setSliderInput}
                model="hsl"
              />
              <ColorSlider
                name="saturation"
                onChange={setSliderInput}
                model="hsl"
              />
              <ColorSlider
                name="luminosity"
                onChange={setSliderInput}
                model="hsl"
              />
              <ColorSlider
                name="alpha"
                step={0.01}
                max={1}
                onChange={setSliderInput}
                model="hsl"
              />
              <CodeInput
                name="hsl"
                onChange={onChangeText}
                pattern={colorPatterns.hsl.source}
              />
            </div>
          ) : null}

          {showHwb ? (
            <div className="color-picker">
              <ColorSlider
                name="hue"
                max={360}
                step={1}
                onChange={setSliderInput}
                model="hwb"
              />
              <ColorSlider
                name="whiteness"
                onChange={setSliderInput}
                model="hwb"
              />
              <ColorSlider
                name="blackness"
                onChange={setSliderInput}
                model="hwb"
              />
              <ColorSlider
                name="alpha"
                step={0.01}
                max={1}
                onChange={setSliderInput}
                model="hwb"
              />
              <CodeInput
                name="hwb"
                onChange={onChangeText}
                pattern={colorPatterns.hwb.source}
              />
            </div>
          ) : null}

          {showRgb ? (
            <div className="color-picker">
              <ColorSlider
                name="red"
                onChange={setSliderInput}
                max={255}
                model="rgb"
              />
              <ColorSlider
                name="green"
                onChange={setSliderInput}
                max={255}
                model="rgb"
              />
              <ColorSlider
                name="blue"
                onChange={setSliderInput}
                max={255}
                model="rgb"
              />
              <ColorSlider
                name="alpha"
                step={0.01}
                max={1}
                onChange={setSliderInput}
                model="rgb"
              />
              <CodeInput
                name="rgb"
                onChange={onChangeText}
                pattern={colorPatterns.rgb.source}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
