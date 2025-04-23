import React from "react";
import { ColorContextType } from "../hooks/useColor";

/**
 * Context for managing color state across the application.
 * Provides access to color data and methods to manipulate it.
 */
export const ColorContext = React.createContext<ColorContextType | null>(null);
