import React from "react";
import { useColorStore } from "../utils/colorStore";
import { setRoot, updateHsvGradients, updateOklchGradients, updateUiColor } from "../utils";
import { rainbowBg } from "../utils/gradientUtils";

/**
 * Custom hook that manages gradient updates and color synchronization effects.
 * Handles the complex logic of updating CSS gradients when colors change
 * and maintains synchronization with external DOM elements.
 * 
 * This hook encapsulates the side effects that need to happen when:
 * - Component mounts (initialize gradients)
 * - Color values change (update gradients)
 * - P3 gamut settings change (update OKLCH gradients)
 */
export const useGradientEffects = (
  updateInputs: (
    newColor: ReturnType<typeof useColorStore.getState>["colorObject"],
    fromInput?: string,
  ) => void,
) => {
  React.useEffect(() => {
    // Initialize gradients and inputs on component mount
    const state = useColorStore.getState();
    const initialColor = state.colorObject;
    
    // Ensure CSS variables are set for the initial color
    updateUiColor(initialColor, state.showP3, state.gamutGaps);
    updateInputs(initialColor);
    
    // Set up rainbow gradient background for hue sliders
    setRoot("rainbow", rainbowBg());
    
    // Initialize color model-specific gradients
    updateHsvGradients(initialColor); // HSV color space gradients
    updateOklchGradients(initialColor, state.showP3, state.gamutGaps); // OKLCH with P3 gamut support

    // Subscribe to state changes for continuous gradient updates
    const unsubscribe = useColorStore.subscribe((state) => {
      const newColor = state.colorObject;
      
      // Update all input elements to reflect new color
      updateInputs(newColor);
      
      // Update rainbow gradient (affects hue sliders across all color models)
      setRoot("rainbow", rainbowBg());
      
      // Update model-specific gradients
      updateHsvGradients(newColor);
      updateOklchGradients(newColor, state.showP3, state.gamutGaps);
    });

    // Cleanup subscription on unmount to prevent memory leaks
    return () => unsubscribe();
  }, [updateInputs]);
};