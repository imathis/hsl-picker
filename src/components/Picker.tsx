import React, { useEffect } from "react";
import { useColorStore } from "../utils/colorStore";
import { ColorModel } from "../types";
import { allColorParts, colorPatterns } from "../utils/colorParsing";
import { setRoot } from "../utils"; // Corrected import path
import { background, rainbowBg } from "../utils/gradientUtils";
import { CodeInput, Input } from "./Inputs";
import { ColorModelPicker } from "./ColorModelPicker";

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
    (state) => state[name as keyof typeof state],
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
        value={String(currentValue)} // Ensure the input reflects the current value
        onChange={handleChange}
        {...props}
        step={0.001}
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
  const setColor = useColorStore((state) => state.setColor);
  const adjustColor = useColorStore((state) => state.adjustColor);
  const [visibleModels, setVisibleModels] = React.useState<
    Record<keyof ColorModel, boolean>
  >({ hsl: true, hwb: false, rgb: false });

  const swatch = React.useRef<HTMLDivElement>(null);

  const updateInputs = (
    newColor: ReturnType<typeof useColorStore.getState>["colorObject"],
    fromInput?: string,
  ) => {
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

  // Subscribe to colorObject changes outside the render cycle
  React.useEffect(() => {
    // Initial update on mount
    const initialColor = useColorStore.getState().colorObject;
    updateInputs(initialColor);
    setRoot("rainbow", rainbowBg());

    // Subscribe to state changes
    const unsubscribe = useColorStore.subscribe((state) => {
      const newColor = state.colorObject;
      updateInputs(newColor);
      setRoot("rainbow", rainbowBg());
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <ColorModelPicker
        visibleModels={visibleModels}
        setVisibleModels={setVisibleModels}
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
            ([modelKey, isVisible]) =>
              isVisible && (
                <div key={modelKey} className="color-picker">
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
