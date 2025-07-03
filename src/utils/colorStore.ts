import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { ColorModel, ColorObject } from "../types";
import { createColorObject } from "../utils/colorConversion";
import {
  colorModels,
  colorPatterns,
  parseOklchUrl,
} from "../utils/colorParsing";

export interface ColorState {
  hue: number;
  saturation: number;
  luminosity: number;
  hsvSaturation: number;
  value: number;
  whiteness: number;
  blackness: number;
  red: number;
  green: number;
  blue: number;
  oklchLightness: number;
  oklchChroma: number;
  oklchHue: number;
  alpha: number;
  hex: string;
  model: keyof ColorModel | "hex";
  showP3: boolean; // Toggle for P3 vs sRGB gamut display
  gamutGaps: boolean; // Toggle for gradient behavior: false = smooth (browser fallback), true = hard cutoffs
  visibleModels: Record<keyof ColorModel, boolean>; // Which color models are visible
  colorObject: ColorObject; // Add ColorObject to the state
  setColor: (c: string | ColorObject, model?: keyof ColorModel | "hex") => ColorObject;
  adjustColor: (args: {
    [key: string]: string;
    model: keyof ColorModel | "hex";
  }) => ColorObject;
  setShowP3: (showP3: boolean) => void;
  setGamutGaps: (gamutGaps: boolean) => void;
  setVisibleModels: (models: Record<keyof ColorModel, boolean>) => void;
  colorModels: ColorModel;
  getColorObject: () => ColorObject;
}

// Generate a random HWB color
const generateRandomHwb = () => {
  const hue = Math.floor(Math.random() * 360);
  const whiteness = Math.floor(Math.random() * 40) + 10; // 10-50%
  const blackness = Math.floor(Math.random() * 40) + 10; // 10-50%
  return `hwb(${hue} ${whiteness}% ${blackness}%)`;
};

export const useColorStore = create<ColorState>()(
  persist(
    (set, get) => {
      // Generate a random HWB color as default
      const initialColorObject = createColorObject(generateRandomHwb());

      return {
        hue: initialColorObject.hue,
        saturation: initialColorObject.saturation,
        luminosity: initialColorObject.luminosity,
        hsvSaturation: initialColorObject.hsvSaturation,
        value: initialColorObject.value,
        whiteness: initialColorObject.whiteness,
        blackness: initialColorObject.blackness,
        red: initialColorObject.red,
        green: initialColorObject.green,
        blue: initialColorObject.blue,
        oklchLightness: initialColorObject.oklchLightness,
        oklchChroma: initialColorObject.oklchChroma,
        oklchHue: initialColorObject.oklchHue,
        alpha: initialColorObject.alpha,
        hex: initialColorObject.hex,
        model: initialColorObject.model,
        showP3: true, // Default to showing P3 gamut
        gamutGaps: true, // Default to smooth gradients (browser fallback)
        visibleModels: {
          oklch: false,
          hwb: true,
          hsl: false,
          hsv: false,
          rgb: false,
        }, // Default visible models
        colorObject: initialColorObject, // Initialize colorObject
        colorModels,
        setColor: (c: string | ColorObject, model?: keyof ColorModel | "hex") => {
          // Optional model parameter enables precision preservation for OKLCH colors
          // When provided, createColorObject uses it to bypass RGB conversion
          const newColor: ColorObject =
            typeof c === "string" ? createColorObject(c, model) : c;
          set({
            hue: newColor.hue,
            saturation: newColor.saturation,
            luminosity: newColor.luminosity,
            hsvSaturation: newColor.hsvSaturation,
            value: newColor.value,
            whiteness: newColor.whiteness,
            blackness: newColor.blackness,
            red: newColor.red,
            green: newColor.green,
            blue: newColor.blue,
            oklchLightness: newColor.oklchLightness,
            oklchChroma: newColor.oklchChroma,
            oklchHue: newColor.oklchHue,
            alpha: newColor.alpha,
            hex: newColor.hex,
            model: newColor.model,
            colorObject: newColor, // Store the ColorObject
          });
          return newColor;
        },
        adjustColor: (args: {
          [key: string]: string;
          model: keyof ColorModel | "hex";
        }) => {
          const currentColor = get().colorObject; // Use the stored ColorObject

          // Convert string values to numbers for numeric properties
          const numericArgs: { [key: string]: string | number } = {};
          Object.entries(args).forEach(([key, value]) => {
            if (key === "model") {
              numericArgs[key] = value;
            } else {
              // Convert to number if it's a numeric property
              const numValue = parseFloat(value);
              numericArgs[key] = isNaN(numValue) ? value : numValue;
            }
          });

          const newColor = currentColor.set(
            numericArgs as Partial<ColorParts> & {
              model?: keyof ColorModel | "hex";
            },
          );
          set({
            hue: newColor.hue,
            saturation: newColor.saturation,
            luminosity: newColor.luminosity,
            hsvSaturation: newColor.hsvSaturation,
            value: newColor.value,
            whiteness: newColor.whiteness,
            blackness: newColor.blackness,
            red: newColor.red,
            green: newColor.green,
            blue: newColor.blue,
            oklchLightness: newColor.oklchLightness,
            oklchChroma: newColor.oklchChroma,
            oklchHue: newColor.oklchHue,
            alpha: newColor.alpha,
            hex: newColor.hex,
            model: newColor.model,
            colorObject: newColor, // Update the ColorObject
          });
          return newColor;
        },
        setShowP3: (showP3: boolean) => {
          set({ showP3 });
        },
        setGamutGaps: (gamutGaps: boolean) => {
          set({ gamutGaps });
        },
        setVisibleModels: (
          visibleModels: Record<keyof ColorModel, boolean>,
        ) => {
          set({ visibleModels });
        },
        getColorObject: () => {
          return get().colorObject; // Simply return the stored ColorObject
        },
      };
    },
    {
      name: "hslpicker-storage", // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        showP3: state.showP3,
        gamutGaps: state.gamutGaps,
        visibleModels: state.visibleModels,
        // Persist the URL format: hex for sRGB, OKLCH URL format for wide gamut
        persistedColor: state.model === "oklch" 
          ? `${state.oklchLightness},${state.oklchChroma},${state.oklchHue},${state.alpha}`
          : state.hex.substring(1), // Remove # from hex
      }),
      onRehydrateStorage: () => {
        // Return a function that runs after rehydration
        return (state, error) => {
          if (error) {
            console.warn("Failed to rehydrate state:", error);
          }
          
          // Only restore persisted color if there's no URL
          // Set the URL hash and let normal URL initialization handle the rest
          if (!window.location.hash && state && state.persistedColor) {
            // Set URL hash to persisted color format
            window.location.hash = `#${state.persistedColor}`;
            // URL initialization will be handled by the useUrlInitialization hook
          }
          // If no URL and no persisted color, keep the random color from initialization
        };
      },
    },
  ),
);

// Initialize color from URL only
export const initializeColorFromUrl = () => {
  const store = useColorStore.getState();
  const hash = window.location.hash;
  
  if (!hash) return;
  
  let urlColor: string | ColorObject | null = null;
  
  // OKLCH URL FORMAT: Check for precision-preserving OKLCH format (#L,C,H,A)
  if (colorPatterns.oklchUrl.test(hash)) {
    const oklchValues = parseOklchUrl(hash);
    if (oklchValues) {
      const [lightness, chroma, hue, alpha] = oklchValues;
      urlColor = createColorObject(
        `oklch(${lightness} ${chroma} ${hue} / ${alpha})`,
        "oklch" // Preserve precision
      );
      
      // Auto-enable OKLCH picker for OKLCH URLs
      const currentVisibleModels = store.visibleModels;
      if (!currentVisibleModels.oklch) {
        store.setVisibleModels({ ...currentVisibleModels, oklch: true });
      }
    }
  }
  // HEX URL FORMAT
  else if (colorPatterns.hex.test(hash)) {
    urlColor = hash;
  }
  
  if (urlColor) {
    store.setColor(urlColor);
  }
};

// Remove duplicate initialization - onRehydrateStorage handles this
