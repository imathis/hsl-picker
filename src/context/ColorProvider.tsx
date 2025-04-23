import React from "react";
import { ColorContext } from "./ColorContext";
import { useColorHooks } from "../hooks";
import { colorPatterns, randomHsl } from "../utils";

/**
 * Props for the ColorProvider component.
 */
interface ColorProviderProps {
  children: React.ReactNode;
}

/**
 * Provides the color context to the application.
 * Initializes the color based on the URL hash or a random color.
 * @param props - Props for the provider, including children.
 */
export const ColorProvider = ({ children }: ColorProviderProps) => {
  // Initialize color from URL hash or a random HSL color
  const color = React.useMemo(() => {
    return colorPatterns.hex.test(window.location.hash)
      ? window.location.hash
      : randomHsl();
  }, []);

  const value = useColorHooks({ color });

  return (
    // Wrap children in a form to prevent default submission behavior
    // Note: onSubmit is set to null due to sandbox restrictions
    <form onSubmit={() => null}>
      <ColorContext.Provider value={value}>{children}</ColorContext.Provider>
    </form>
  );
};
