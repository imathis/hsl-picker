import React from "react";
import { ColorObject } from "../types";

/**
 * Custom hook to update the URL hash with the current color's hex value.
 * @param color - The current color object.
 */
export const useUpdateUrl = (color: ColorObject | null): void => {
  React.useEffect(() => {
    // Delay URL update to avoid excessive history changes
    const ref = window.setTimeout(() => {
      try {
        if (color?.hex) {
          window.history.replaceState({}, "", color.hex);
        }
      } catch (e) {
        console.error(e);
      }
    }, 300);

    // Cleanup timeout on unmount or color change
    return () => window.clearTimeout(ref);
  }, [color]);
};
