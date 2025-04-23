import React from "react";
import { ColorContext } from "../context";
import { ColorModel, ColorObject } from "../types";
import { updateModelVars, setRootColor } from "../utils/cssUtils";
import { randomColor } from "../utils/randomColor";
import { useUpdateUrl } from "./useUpdateUrl";
import { createColorObject, colorModels } from "../utils";

// Define the context type using exported interfaces
export interface ColorContextType {
  colorModels: ColorModel;
  color: ColorObject | null;
  setColor: (c: string | ColorObject) => ColorObject | null;
  adjustColor: (args: {
    [key: string]: string;
    model: keyof ColorModel | "hex";
  }) => ColorObject | null;
}

/**
 * Options for the useColorHooks hook.
 */
interface UseColorHooksOptions {
  color?: ColorObject | string | null;
}

/**
 * Custom hook for managing color state and operations.
 * Provides functions to set and adjust colors, and updates the URL and CSS variables.
 * @param options - Options for initializing the color.
 * @returns An object with color state and methods to manipulate it.
 */
export const useColorHooks = (
  options: UseColorHooksOptions = {},
): ColorContextType | null => {
  const { color: initialColor = null } = options;
  const [color, setColorValue] = React.useState<ColorObject | null>(null);

  useUpdateUrl(color);

  const setColor = React.useCallback(
    (c: string | ColorObject): ColorObject | null => {
      // Convert string to ColorObject if necessary
      let newColor: ColorObject =
        typeof c === "string" ? createColorObject(c) : c;

      if (newColor) {
        updateModelVars({ color: newColor });
        setColorValue(newColor);
        setRootColor(newColor);
        return newColor;
      }
      return null;
    },
    [],
  );

  // Initialize color on first render
  React.useEffect(() => {
    if (!color) {
      setColor(initialColor || randomColor());
    }
  }, [color, setColor, initialColor]);

  const adjustColor = React.useCallback(
    (args: {
      [key: string]: string;
      model: keyof ColorModel | "hex";
    }): ColorObject | null => {
      if (!color) throw new Error("Color is not initialized");
      return setColor(color.set(args));
    },
    [setColor, color],
  );

  return {
    colorModels,
    color,
    setColor,
    adjustColor,
  };
};

/**
 * Hook to access the color context.
 * @returns The color context value.
 * @throws Error if used outside a ColorContext Provider.
 */
export const useColor = (): ColorContextType => {
  const context = React.useContext(ColorContext);
  if (!context) {
    throw new Error("useColor must be used within a ColorContext Provider");
  }
  return context;
};
