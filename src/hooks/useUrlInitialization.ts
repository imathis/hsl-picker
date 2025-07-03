import React from "react";
import { initializeColorFromUrl } from "../utils/colorStore";

/**
 * Hook that initializes color from URL hash on component mount.
 * This runs after rehydration to ensure URL takes precedence over localStorage.
 */
export const useUrlInitialization = () => {
  React.useEffect(() => {
    // Initialize color from URL if present
    initializeColorFromUrl();
  }, []); // Run once on mount
};