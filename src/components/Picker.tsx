import React from "react";
import { useColor } from "../hooks";
import { ColorModel, ColorObject } from "../types";
import { allColorParts, colorPatterns } from "../utils/colorParsing";
import { setRoot } from "../utils/cssUtils";
import { background, rainbowBg } from "../utils/gradientUtils";
import { CodeInput, Input } from "./Inputs";
import { ColorModelPicker } from "./ColorModelPicker";
import { useColorStore, ColorState } from "../utils/colorStore";

const setValue = (name: string, value: string): void => {
  const elements = document.querySelectorAll<HTMLInputElement>(
    `[name=${name}]`,
  );
  elements.forEach((el) => (el.value = value));
};

interface ColorSliderProps {
  name: string;
  model: keyof ColorModel | "hex";
  onChange: (
    name: string,
    value: string,
    model: keyof ColorModel | "hex",
  ) => void;
  max?: number | string;
  step?: number | string;
  min?: number | string;
  style?: React.CSSProperties;
}

const ColorSlider: React.FC<ColorSliderProps> = ({
  name,
  model,
  onChange,
  ...props
}) => {
  // Subscribe to only the specific color property needed for this slider
  const currentValue = useColorStore(
    (state) => state[name as keyof ColorState],
  );

  const handleChange = ([name, value]: [string, string]) => {
    onChange(name, value, model);
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
          value={String(currentValue)} // Ensure the input reflects the current value
          onChange={handleChange}
          {...props}
          style={{ background: background[model][name], ...props.style }}
        />
      </div>
      <Input
        type="number"
        data-model={model}
        name={`${name}Num`}
        min={0}
        max={100}
        step={0.1}
        value={String(currentValue)} // Ensure the input reflects the current value
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

const colorModelConfig: Record<
  keyof ColorModel,
  { sliders: { name: string; max?: number; step?: number }[]; pattern: RegExp }
> = {
  hsl: {
    sliders: [
      { name: "hue", max: 360, step: 1 },
      { name: "saturation", step: 0.1 },
      { name: "luminosity", step: 0.1 },
      { name: "alpha", max: 1, step: 0.01 },
    ],
    pattern: colorPatterns.hsl,
  },
  hwb: {
    sliders: [
      { name: "hue", max: 360, step: 1 },
      { name: "whiteness", step: 0.1 },
      { name: "blackness", step: 0.1 },
      { name: "alpha", max: 1, step: 0.01 },
    ],
    pattern: colorPatterns.hwb,
  },
  rgb: {
    sliders: [
      { name: "red", max: 255 },
      { name: "green", max: 255 },
      { name: "blue", max: 255 },
      { name: "alpha", max: 1, step: 0.01 },
    ],
    pattern: colorPatterns.rgb,
  },
};

export const Picker: React.FC = () => {
  const { color, adjustColor, setColor } = useColor();
  const swatch = React.useRef<HTMLDivElement>(null);
  const [visibleModels, setVisibleModels] = React.useState<
    Record<keyof ColorModel, boolean>
  >({ hsl: true, hwb: false, rgb: false });

  const updateInputs = (newColor: ColorObject, fromInput?: string) => {
    const inputs = {
      hsl: newColor.hsl,
      hwb: newColor.hwb,
      rgb: newColor.rgb,
      hex: newColor.hex,
    };
    Object.entries(inputs)
      .filter(([k]) => k !== fromInput)
      .forEach(([k, v]) => setValue(k, v));

    allColorParts.forEach((prop) => {
      setValue(prop, String(newColor[prop]));
      if (`${prop}Num` !== fromInput)
        setValue(`${prop}Num`, String(newColor[prop]));
    });
  };

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

  const handleTextChange = (name: string, value: string) => {
    const newColor = setColor(value);
    if (newColor) updateInputs(newColor, name);
  };

  React.useEffect(() => {
    if (color) {
      updateInputs(color);
      setRoot("rainbow", rainbowBg());
    }
  }, [color]);

  if (!color) return null;

  return (
    <div>
      <ColorModelPicker
        visibleModels={visibleModels}
        setVisibleModels={setVisibleModels}
        color={color}
        updateInputs={updateInputs}
      />
      <div className="main">
        <div className="color-swatch-wrapper">
          <div className="color-swatch" ref={swatch} />
          <CodeInput
            name="hex"
            onChange={([name, value]) => handleTextChange(name, value)}
            pattern={colorPatterns.hex.source}
          />
        </div>
        <div className="color-pickers">
          {Object.entries(visibleModels).map(
            ([model, isVisible]) =>
              isVisible && (
                <div key={model} className="color-picker">
                  {colorModelConfig[model as keyof ColorModel].sliders.map(
                    ({ name, max, step }) => (
                      <ColorSlider
                        key={name}
                        name={name}
                        max={max}
                        step={step}
                        onChange={handleSliderChange}
                        model={model as keyof ColorModel}
                      />
                    ),
                  )}
                  <CodeInput
                    name={model}
                    onChange={([name, value]) => handleTextChange(name, value)}
                    pattern={
                      colorModelConfig[model as keyof ColorModel].pattern.source
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
