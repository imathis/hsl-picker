import React from "react";
import { ColorObject } from "../types";

/**
 * Custom hook to update the URL hash with the current color value.
 * Uses hex format for sRGB colors, OKLCH format for wide gamut colors.
 * @param color - The current color object.
 */
export const useUpdateUrl = (color: ColorObject | null): void => {
  React.useEffect(() => {
    // Delay URL update to avoid excessive history changes
    const ref = window.setTimeout(() => {
      try {
        if (color) {
          // DUAL URL FORMAT STRATEGY: Preserve precision based on color characteristics
          // Problem: Hex format truncates wide-gamut OKLCH colors to sRGB limits
          // Solution: Use OKLCH format for OKLCH model, hex for all other models
          let url: string;
          if (color.model === 'oklch') {
            // Format: #L,C,H,A (e.g., #0.7,0.1,154,1)
            // Preserves exact OKLCH values including 3-decimal precision for hue
            url = `#${color.oklchLightness.toFixed(3)},${color.oklchChroma.toFixed(3)},${color.oklchHue.toFixed(3)},${color.alpha.toFixed(3)}`;
          } else {
            // Use hex format for sRGB-compatible models (HSL, RGB, etc.)
            // Efficient and universally supported for standard web colors
            url = color.hex;
          }
          window.history.replaceState({}, "", url);
        }
      } catch (e) {
        console.error(e);
      }
    }, 300);

    // Cleanup timeout on unmount or color change
    return () => window.clearTimeout(ref);
  }, [color]);
};
