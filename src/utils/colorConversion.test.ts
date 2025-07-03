import { describe, it, expect } from "vitest";
import {
  toString,
  rgbaToHex,
  toHslvwb,
  toRgb,
  createColorObject,
} from "./colorConversion";
import { RGBColor, HSLColor, HSVColor, HWBColor, HEXColor, OKLCHColor } from "../types";

describe("colorConversion", () => {
  describe("toString", () => {
    it("formats HWB color correctly with alpha", () => {
      const hwb: HWBColor = {
        hue: 0,
        whiteness: 50,
        blackness: 50,
        alpha: 0.5,
      };
      expect(toString.hwb(hwb)).toBe("hwb(0 50% 50% / 0.5)");
    });

    it("formats HWB color correctly without alpha", () => {
      const hwb: HWBColor = { hue: 0, whiteness: 50, blackness: 50 };
      expect(toString.hwb(hwb)).toBe("hwb(0 50% 50%)");
    });

    it("formats HSL color correctly without alpha", () => {
      const hsl: HSLColor = { hue: 120, saturation: 100, luminosity: 50 };
      expect(toString.hsl(hsl)).toBe("hsl(120 100% 50%)");
    });

    it("formats HSL color correctly with alpha", () => {
      const hsl: HSLColor = {
        hue: 120,
        saturation: 100,
        luminosity: 50,
        alpha: 0.5,
      };
      expect(toString.hsl(hsl)).toBe("hsla(120 100% 50% / 0.5)");
    });

    it("formats HSV color correctly without alpha", () => {
      const hsv: HSVColor = { hue: 120, hsvSaturation: 100, value: 50 };
      expect(toString.hsv(hsv)).toBe("hsv(120 100% 50%)");
    });

    it("formats HSV color correctly with alpha", () => {
      const hsv: HSVColor = {
        hue: 120,
        hsvSaturation: 100,
        value: 50,
        alpha: 0.5,
      };
      expect(toString.hsv(hsv)).toBe("hsv(120 100% 50% / 0.5)");
    });

    it("formats RGB color correctly without alpha", () => {
      const rgb: RGBColor = { red: 255, green: 0, blue: 0, alpha: 1 };
      expect(toString.rgb(rgb)).toBe("rgb(255 0 0)");
    });

    it("formats RGB color correctly with alpha", () => {
      const rgb: RGBColor = { red: 255, green: 0, blue: 0, alpha: 0.5 };
      expect(toString.rgb(rgb)).toBe("rgba(255 0 0 / 0.5)");
    });

    it("formats HEX color correctly", () => {
      const hex: HEXColor = { hex: "#ff0000" };
      expect(toString.hex(hex)).toBe("#ff0000");
    });

    it("formats OKLCH color correctly without alpha", () => {
      const oklch: OKLCHColor = { oklchLightness: 0.5, oklchChroma: 0.2, oklchHue: 180 };
      expect(toString.oklch(oklch)).toBe("oklch(0.5 0.2 180)");
    });

    it("formats OKLCH color correctly with alpha", () => {
      const oklch: OKLCHColor = {
        oklchLightness: 0.755,
        oklchChroma: 0.15,
        oklchHue: 45,
        alpha: 0.8,
      };
      expect(toString.oklch(oklch)).toBe("oklch(0.755 0.15 45 / 0.8)");
    });
  });

  describe("rgbaToHex", () => {
    it("converts RGB to hex", () => {
      const rgb: RGBColor = { red: 255, green: 0, blue: 0 };
      expect(rgbaToHex(rgb)).toBe("#ff0000");
    });

    it("converts RGBA to hex with alpha", () => {
      const rgb: RGBColor = { red: 255, green: 0, blue: 0, alpha: 0.5 };
      expect(rgbaToHex(rgb)).toBe("#ff000080");
    });

    it("handles invalid RGB values (NaN)", () => {
      const rgb: RGBColor = { red: NaN, green: 0, blue: 0 };
      expect(rgbaToHex(rgb)).toBe("#000000");
    });
  });

  describe("toHslvwb", () => {
    it("converts RGB to HSL, HSV, and HWB (red dominant)", () => {
      const rgb: RGBColor = { red: 255, green: 0, blue: 0 };
      const result = toHslvwb(rgb);
      expect(result).toMatchObject({
        hue: 0,
        saturation: 100,
        luminosity: 50,
        value: 100,
        whiteness: 0,
        blackness: 0,
        alpha: 1,
        hsl: "hsl(0 100% 50%)",
        hsv: "hsv(0 100% 100%)",
        hwb: "hwb(0 0% 0%)",
      });
    });

    it("converts RGB to HSL, HSV, and HWB (achromatic/gray)", () => {
      const rgb: RGBColor = { red: 128, green: 128, blue: 128 };
      const result = toHslvwb(rgb);
      expect(result.hue).toBe(0);
      expect(result.saturation).toBe(0);
      expect(result.alpha).toBe(1);
      expect(result.value).toBeCloseTo(50, 0);
      expect(result.hsvSaturation).toBe(0);
      // Allow some precision difference for culori vs manual calculations
      expect(result.luminosity).toBeCloseTo(50, 0);
      expect(result.whiteness).toBeCloseTo(50, 0);
      expect(result.blackness).toBeCloseTo(50, 0);
      expect(result.hsl).toMatch(/^hsl\(0 0% 50/);
      expect(result.hsv).toMatch(/^hsv\(0 0% 50/);
      expect(result.hwb).toMatch(/^hwb\(0 50/);
    });

    it("converts RGB to HSL, HSV, and HWB with alpha", () => {
      const rgb: RGBColor = { red: 255, green: 0, blue: 0, alpha: 0.5 };
      const result = toHslvwb(rgb);
      expect(result).toMatchObject({
        hue: 0,
        saturation: 100,
        luminosity: 50,
        value: 100,
        whiteness: 0,
        blackness: 0,
        alpha: 0.5,
        hsl: "hsla(0 100% 50% / 0.5)",
        hsv: "hsv(0 100% 100% / 0.5)",
        hwb: "hwb(0 0% 0% / 0.5)",
      });
    });
  });

  describe("toRgb", () => {
    it("parses RGB string", () => {
      const result = toRgb("rgb(255, 0, 0)");
      expect(result).toMatchObject({
        red: 255,
        green: 0,
        blue: 0,
        alpha: 1,
        rgb: "rgb(255 0 0)",
        hex: "#ff0000",
      });
    });
    });

    it("converts named color to RGB", () => {
      const result = toRgb("red");
      expect(result).toMatchObject({
        red: 255,
        green: 0,
        blue: 0,
        alpha: 1,
        rgb: "rgb(255 0 0)",
        hex: "#ff0000",
      });
    });

    it("throws error for invalid color", () => {
      expect(() => toRgb("invalid")).toThrow(
        /Invalid Color Error: `invalid` is not a valid color/,
      );
    });
  });

  describe("createColorObject", () => {
    it("creates a ColorObject from RGB string", () => {
      const color = "rgb(255 0 0)";
      const colorObj = createColorObject(color);
      expect(colorObj).toMatchObject({
        model: "rgb",
        red: 255,
        green: 0,
        blue: 0,
        alpha: 1,
        hex: "#ff0000",
        hsl: "hsl(0 100% 50%)",
        hsv: "hsv(0 100% 100%)",
        hwb: "hwb(0 0% 0%)",
        rgb: "rgb(255 0 0)",
      });
      expect(colorObj.rgb).toBe(color); // Preserves input
    });

    it("creates a ColorObject from OKLCH string (percentage input)", () => {
      const color = "oklch(62.8% 0.258 29.2)";
      const colorObj = createColorObject(color);
      expect(colorObj).toMatchObject({
        model: "oklch",
        oklchLightness: 0.628,
        oklchChroma: 0.258,
        oklchHue: 29.2,
        alpha: 1,
      });
      expect(colorObj.oklch).toBe("oklch(0.628 0.258 29.2)"); // Output preserves decimal precision
      // Should also have other color representations
      expect(typeof colorObj.hex).toBe("string");
      expect(typeof colorObj.rgb).toBe("string");
      expect(typeof colorObj.hsl).toBe("string");
    });

    it("creates a ColorObject from OKLCH string (decimal input)", () => {
      const color = "oklch(0.628 0.258 29.2)";
      const colorObj = createColorObject(color);
      expect(colorObj).toMatchObject({
        model: "oklch",
        oklchLightness: 0.628, // Now uses 0-1 scale internally
        oklchChroma: 0.258,
        oklchHue: 29.2,
        alpha: 1,
      });
      expect(colorObj.oklch).toBe("oklch(0.628 0.258 29.2)"); // Output preserves decimal precision
    });

    it("creates a ColorObject from HEX string", () => {
      const color = "#ff0000";
      const colorObj = createColorObject(color);
      expect(colorObj).toMatchObject({
        model: "hex",
        red: 255,
        green: 0,
        blue: 0,
        alpha: 1,
        hex: "#ff0000",
        hsl: "hsl(0 100% 50%)",
        hwb: "hwb(0 0% 0%)",
        rgb: "rgb(255 0 0)",
      });
      expect(colorObj.hex).toBe(color); // Preserves input
    });

    it("sets new RGB properties", () => {
      const color = "#ff0000";
      const colorObj = createColorObject(color);
      const updated = colorObj.set({ red: 0, green: 255, model: "rgb" });
      expect(updated.rgb).toBe("rgb(0 255 0)");
      expect(updated.hex).toBe("#00ff00");
    });

    it("sets new properties with alpha", () => {
      const color = "#ff0000";
      const colorObj = createColorObject(color);
      const updated = colorObj.set({ alpha: 0.5, model: "rgb" });
      expect(updated.rgb).toBe("rgba(255 0 0 / 0.5)");
      expect(updated.hex).toBe("#ff000080");
    });

    it("converts to string in specified model", () => {
      const color = "hsl(0 100% 50%)";
      const colorObj = createColorObject(color);
      expect(colorObj.toString("hex")).toBe("#ff0000");
      expect(colorObj.toString("rgb")).toBe("rgb(255 0 0)");
      expect(colorObj.toString("hsv")).toBe("hsv(0 100% 100%)");
      expect(typeof colorObj.toString("oklch")).toBe("string");
    });

    it("sets OKLCH properties correctly", () => {
      const color = "oklch(50% 0.2 180)";
      const colorObj = createColorObject(color);
      const updated = colorObj.set({ oklchLightness: 0.75, oklchChroma: 0.1, model: "oklch" });
      expect(updated.oklchLightness).toBe(0.75);
      expect(updated.oklchChroma).toBe(0.1);
      expect(updated.oklchHue).toBe(180); // Should preserve hue
      expect(updated.oklch).toMatch(/oklch\(0\.75 0\.1 180\)/); // Decimal format
    });

    it("creates a ColorObject from HSV string", () => {
      const color = "hsv(120 50% 75%)";
      const colorObj = createColorObject(color);
      expect(colorObj).toMatchObject({
        model: "hsv",
        hue: 120,
        hsvSaturation: 50,
        value: 75,
        alpha: 1,
      });
      expect(colorObj.hsv).toBe(color); // Preserves input
    });

    it("throws error for invalid color model detection", () => {
      expect(() => createColorObject("invalid")).toThrow(
        /Color Error: No matching color model could be found for invalid/,
      );
    });
  });

  describe("HSV conversion functions", () => {
    it("converts HSV to RGB correctly using culori", () => {
      // Test HSV conversions through createColorObject which now uses culori
      const redHsv = createColorObject("hsv(0 100% 100%)");
      expect(redHsv.red).toBe(255);
      expect(redHsv.green).toBe(0);
      expect(redHsv.blue).toBe(0);
      
      const greenHsv = createColorObject("hsv(120 100% 100%)");
      expect(greenHsv.red).toBe(0);
      expect(greenHsv.green).toBe(255);
      expect(greenHsv.blue).toBe(0);
      
      const blueHsv = createColorObject("hsv(240 100% 100%)");
      expect(blueHsv.red).toBe(0);
      expect(blueHsv.green).toBe(0);
      expect(blueHsv.blue).toBe(255);
      
      const grayHsv = createColorObject("hsv(0 0% 50%)");
      expect(grayHsv.red).toBe(128);
      expect(grayHsv.green).toBe(128);
      expect(grayHsv.blue).toBe(128);
    });

    it("converts RGB to HSV correctly using culori", () => {
      // Test RGB to HSV conversions through toHslvwb
      const redResult = toHslvwb({ red: 255, green: 0, blue: 0 });
      expect(redResult.hsvSaturation).toBe(100);
      expect(redResult.value).toBe(100);
      
      const greenResult = toHslvwb({ red: 0, green: 255, blue: 0 });
      expect(greenResult.hue).toBe(120);
      expect(greenResult.hsvSaturation).toBe(100);
      expect(greenResult.value).toBe(100);
      
      const grayResult = toHslvwb({ red: 128, green: 128, blue: 128 });
      expect(grayResult.hue).toBe(0);
      expect(grayResult.hsvSaturation).toBe(0);
      expect(grayResult.value).toBeCloseTo(50, 0);
    });

    it("HSV round trip conversion", () => {
      // Test round trip: HSV string -> RGB -> HSV values
      const originalHsv = "hsv(180 75% 60%)";
      const colorObj = createColorObject(originalHsv);
      
      expect(colorObj.hue).toBe(180);
      expect(colorObj.hsvSaturation).toBeCloseTo(75, 0);
      expect(colorObj.value).toBeCloseTo(60, 0);
    });
  });

  describe("OKLCH adjustment precision", () => {
    it("should preserve chroma and hue when adjusting only lightness", () => {
      // Test the user's reported issue: oklch(0.52 0.1 81) -> adjust lightness to 0.251
      const original = createColorObject("oklch(0.52 0.1 81)", "oklch");
      const adjusted = original.set({ oklchLightness: 0.251, model: "oklch" });
      
      expect(adjusted.oklchLightness).toBeCloseTo(0.251, 3);
      // Chroma and hue should remain very close to original values
      expect(adjusted.oklchChroma).toBeCloseTo(0.1, 2); // Allow small precision differences
      expect(adjusted.oklchHue).toBeCloseTo(81, 1); // Allow small precision differences
    });

    it("should handle string values like slider inputs", () => {
      // Test what happens when values come in as strings (like from sliders)
      const original = createColorObject("oklch(0.577 0.226 302)", "oklch");
      
      // Simulate what adjustColor does with string conversion
      const stringValue = "0.303";
      const numericValue = parseFloat(stringValue);
      const adjusted = original.set({ oklchLightness: numericValue, model: "oklch" });
      
      expect(adjusted.oklchLightness).toBeCloseTo(0.303, 3);
      // Chroma and hue should remain very close to original values
      expect(adjusted.oklchChroma).toBeCloseTo(0.226, 2);
      expect(adjusted.oklchHue).toBeCloseTo(302, 1);
    });
    
    it("should preserve lightness and hue when adjusting only chroma", () => {
      const original = createColorObject("oklch(0.499 0.17 142)", "oklch");
      const adjusted = original.set({ oklchChroma: 0.25, model: "oklch" });
      
      expect(adjusted.oklchChroma).toBeCloseTo(0.25, 3);
      // Lightness and hue should remain very close to original values
      expect(adjusted.oklchLightness).toBeCloseTo(0.499, 2);
      expect(adjusted.oklchHue).toBeCloseTo(142, 1);
    });
    
    it("should preserve lightness and chroma when adjusting only hue", () => {
      const original = createColorObject("oklch(0.499 0.17 142)", "oklch");
      const adjusted = original.set({ oklchHue: 200, model: "oklch" });
      
      expect(adjusted.oklchHue).toBeCloseTo(200, 1);
      // Lightness and chroma should remain very close to original values
      expect(adjusted.oklchLightness).toBeCloseTo(0.499, 2);
      expect(adjusted.oklchChroma).toBeCloseTo(0.17, 2);
    });

    it("should preserve exact OKLCH values from user reported issue", () => {
      // Test the exact case: oklch(0.444 0.173 282) with lightness adjustment
      const original = createColorObject("oklch(0.444 0.173 282)", "oklch");
      
      // Verify original values are exact
      expect(original.oklchLightness).toBe(0.444);
      expect(original.oklchChroma).toBe(0.173);
      expect(original.oklchHue).toBe(282);
      
      // Adjust lightness to various values
      const adjusted1 = original.set({ oklchLightness: 0.3, model: "oklch" });
      expect(adjusted1.oklchLightness).toBe(0.3);
      expect(adjusted1.oklchChroma).toBe(0.173); // Should be EXACT, not 0.172 or 0.174
      expect(adjusted1.oklchHue).toBe(282);       // Should be EXACT
      
      const adjusted2 = original.set({ oklchLightness: 0.1, model: "oklch" });
      expect(adjusted2.oklchLightness).toBe(0.1);
      expect(adjusted2.oklchChroma).toBe(0.173); // Should NOT go to 0.075
      expect(adjusted2.oklchHue).toBe(282);       // Should be EXACT
    });

    it("should allow cross-model updates to properly change OKLCH", () => {
      // Ensure HSL adjustments still properly update OKLCH values
      const original = createColorObject("oklch(0.444 0.173 282)", "oklch");
      const hslAdjusted = original.set({ saturation: 50, model: "hsl" });
      
      // OKLCH values should change when adjusting from other models
      expect(hslAdjusted.oklchLightness).not.toBe(0.444);
      expect(hslAdjusted.oklchChroma).not.toBe(0.173);
      // This proves cross-model conversion still works
    });
  });

  describe("Hue preservation across color models", () => {
    it("should preserve hue when converting OKLCH with low chroma to HWB", () => {
      // Test case from user: oklch(0.026 0.012 208) should preserve hue 208
      const original = createColorObject("oklch(0.026 0.012 208)", "oklch");
      
      expect(original.oklchHue).toBeCloseTo(208, 1);
      expect(original.hue).toBeCloseTo(208, 1); // HWB hue should also be preserved
      
      // Verify the HWB string representation preserves the hue
      expect(original.hwb).toMatch(/hwb\(208/);
    });

    it("should preserve hue when converting HWB with high blackness to HSL", () => {
      // Test case from user: hwb(131 12.9% 100%) should preserve hue 131
      const original = createColorObject("hwb(131 12.9% 100%)", "hwb");
      
      expect(original.hue).toBeCloseTo(131, 1);
      
      // Verify the HSL string representation preserves the hue
      expect(original.hsl).toMatch(/hsl\(131/);
    });

    it("should preserve hue for achromatic colors during non-hue adjustments", () => {
      // Test low saturation color preserving hue
      const lowSatColor = createColorObject("hsl(45 2% 50%)", "hsl");
      
      // Original hue should be preserved
      expect(lowSatColor.hue).toBeCloseTo(45, 1);
      
      // When adjusting lightness (non-hue adjustment), hue should be preserved
      const adjusted = lowSatColor.set({ luminosity: 30, model: "hsl" });
      expect(adjusted.hue).toBeCloseTo(45, 1);
      expect(adjusted.oklchHue).toBeCloseTo(45, 5); // Allow some conversion tolerance
    });

    it("should preserve OKLCH hue for achromatic colors during lightness adjustments", () => {
      // Test very low chroma OKLCH color
      const lowChromaColor = createColorObject("oklch(0.5 0.005 150)", "oklch");
      
      expect(lowChromaColor.oklchHue).toBeCloseTo(150, 1);
      
      // Adjust lightness - hue should be preserved
      const adjusted = lowChromaColor.set({ oklchLightness: 0.3, model: "oklch" });
      expect(adjusted.oklchHue).toBeCloseTo(150, 1);
      expect(adjusted.hue).toBeCloseTo(150, 5); // HSL hue should also be preserved
    });

    it("should preserve source hue when colors become achromatic through adjustments", () => {
      // Start with a color that has clear hue
      const colorfulColor = createColorObject("hsl(90 80% 50%)", "hsl");
      expect(colorfulColor.hue).toBeCloseTo(90, 1);
      
      // Reduce saturation to make it achromatic - hue should be preserved
      const achromatic = colorfulColor.set({ saturation: 0, model: "hsl" });
      expect(achromatic.hue).toBeCloseTo(90, 1);
      expect(achromatic.saturation).toBe(0);
    });

    it("should preserve hue during cross-model conversions for achromatic colors", () => {
      // Start with OKLCH achromatic color with specific hue
      const oklchAchromatic = createColorObject("oklch(0.4 0.001 275)", "oklch");
      expect(oklchAchromatic.oklchHue).toBeCloseTo(275, 1);
      
      // Convert to HSL model - should preserve the hue concept
      const hslVersion = oklchAchromatic.set({ model: "hsl" });
      expect(hslVersion.hue).toBeCloseTo(275, 10); // Allow some tolerance for very low chroma colors
      
      // Convert back to OKLCH - should preserve original hue
      const backToOklch = hslVersion.set({ model: "oklch" });
      expect(backToOklch.oklchHue).toBeCloseTo(275, 10);
    });

    it("should NOT preserve hue when hue is explicitly being changed", () => {
      // This test ensures hue preservation doesn't interfere with intentional hue changes
      const original = createColorObject("hsl(100 50% 50%)", "hsl");
      expect(original.hue).toBeCloseTo(100, 1);
      
      // Explicitly change hue - should NOT preserve original
      const hueChanged = original.set({ hue: 200, model: "hsl" });
      expect(hueChanged.hue).toBeCloseTo(200, 1);
      expect(hueChanged.hue).not.toBeCloseTo(100, 1);
    });

    it("should preserve exact hue values from user-reported examples", () => {
      // Test the exact examples from user feedback
      
      // Example 1: Very dark OKLCH color
      const darkOklch = createColorObject("oklch(0.123 0.012 208)", "oklch");
      expect(darkOklch.oklchHue).toBeCloseTo(208, 1);
      expect(darkOklch.hue).toBeCloseTo(208, 5); // Allow tolerance for very dark colors
      
      // Make it even darker - hue should be preserved  
      const darkerOklch = darkOklch.set({ oklchLightness: 0.05, model: "oklch" });
      expect(darkerOklch.oklchHue).toBeCloseTo(208, 1);
      
      // Example 2: HWB with very high blackness (achromatic)
      const highBlacknessHwb = createColorObject("hwb(131 12.9% 100%)", "hwb");
      expect(highBlacknessHwb.hue).toBeCloseTo(131, 1);
      
      // Adjust whiteness - hue should be preserved
      const adjustedHwb = highBlacknessHwb.set({ whiteness: 20, model: "hwb" });
      expect(adjustedHwb.hue).toBeCloseTo(131, 1);
    });

    it("should preserve hue in HSL strings when adjusting HWB blackness", () => {
      // User-reported issue: hwb(293 9.8% 78.9%) -> hwb(293 9.8% 81.5%) 
      // should preserve hue 293 in HSL representation, not show 295
      const original = createColorObject("hwb(293 9.8% 78.9%)", "hwb");
      expect(original.hue).toBeCloseTo(293, 1);
      
      // Adjust blackness - both hue object and HSL string should preserve hue 293
      const adjusted = original.set({ blackness: 81.5, model: "hwb" });
      expect(adjusted.hue).toBeCloseTo(293, 1);
      expect(adjusted.hsl).toMatch(/hsl\(293/); // HSL string should show hue 293, not 295
      expect(adjusted.hwb).toMatch(/hwb\(293/); // HWB string should maintain hue 293
    });
  });
