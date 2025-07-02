import React from "react";
import { colorPatterns } from "../utils/colorParsing";
import { CodeInput } from "./Inputs";
import { useColorStore } from "../utils/colorStore";
import { inGamut } from "culori";

interface ColorSwatchProps {
  onHexChange: (name: string, value: string) => void;
}

/**
 * ColorSwatch component displays the current color and provides
 * a hex input field for direct color entry.
 *
 * The swatch serves as a visual reference for the current color selection
 * and the hex input allows for precise color specification using hex codes.
 * 
 * Features:
 * - Detects wide gamut colors (outside sRGB) and shows dual swatches
 * - Indicates when colors are out of P3 range or P3 is unsupported
 * - Provides visual feedback for color gamut limitations
 */
export const ColorSwatch: React.FC<ColorSwatchProps> = ({ onHexChange }) => {
  // Get current color from the store
  const colorObject = useColorStore((state) => state.colorObject);
  
  // Gamut detection: Colors from sRGB-based models are never wide gamut
  const sRgbModels = ['hsl', 'hsv', 'hwb', 'rgb', 'hex'];
  const isFromSrgbModel = sRgbModels.includes(colorObject.model);
  
  let wideGamut = false;
  let outOfRange = false;
  
  if (isFromSrgbModel) {
    // Colors from sRGB models (HSL, HSV, HWB, RGB, HEX) are always in sRGB gamut
    wideGamut = false;
    // Check P3 support for potential out-of-range indication
    const supportsP3 = typeof window !== 'undefined' && 
      window.CSS?.supports?.('color', 'color(display-p3 1 0 0)');
    outOfRange = !supportsP3; // Only out of range if P3 not supported
  } else {
    // For OKLCH colors, check actual gamut
    const oklchColor = {
      mode: 'oklch' as const,
      l: colorObject.oklchLightness,
      c: colorObject.oklchChroma,
      h: colorObject.oklchHue,
      alpha: colorObject.alpha
    };
    
    const isInSrgb = inGamut('rgb')(oklchColor);
    const isInP3 = inGamut('p3')(oklchColor);
    const supportsP3 = typeof window !== 'undefined' && 
      window.CSS?.supports?.('color', 'color(display-p3 1 0 0)');
    
    wideGamut = !isInSrgb; // true when color needs wide gamut display
    outOfRange = !isInP3 || !supportsP3; // true when fallback needed
  }
  return (
    <div>
      {/* Visual color display - styled via CSS using CSS custom properties */}
      <div className="color-swatch">
        {wideGamut ? (
          <>
            <div className="color-swatch-p3">
              <div className="color-swatch-label">
                {outOfRange ? "Fallback" : "P3"}
              </div>
            </div>
            <div className="color-swatch-srgb">
              <div className="color-swatch-label">sRGB</div>
            </div>
          </>
        ) : null}
      </div>

      {/* Hex color input for direct color entry */}
      <CodeInput
        name="hex"
        onChange={([name, value]) => onHexChange(name, value)}
        pattern={colorPatterns.hex.source}
      />
    </div>
  );
};
