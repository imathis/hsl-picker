import React from "react";
import { useColorStore } from "../utils/colorStore";
import { updateUiColor } from "../utils/uiUtils";

/**
 * Hook that reactively updates CSS variables whenever the color changes.
 * This ensures the UI is always in sync with the color state, regardless
 * of how the state was updated (initial load, persist rehydration, user input).
 */
export const useCssVariables = () => {
  const colorObject = useColorStore((state) => state.colorObject);
  const showP3 = useColorStore((state) => state.showP3);
  const gamutGaps = useColorStore((state) => state.gamutGaps);

  React.useEffect(() => {
    // Update CSS variables whenever color or settings change
    updateUiColor(colorObject, showP3, gamutGaps);
  }, [colorObject, showP3, gamutGaps]);
};