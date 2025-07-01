import { describe, it, expect } from "vitest";
import {
  toString,
  rgbaToHex,
  toHslvwb,
  toRgb,
  createColorObject,
} from "./colorConversion";
import { RGBColor, HSLColor, HSVColor, HWBColor, HEXColor, ColorModel } from "../types";

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
      expect(rgbaToHex(rgb)).toBe("#0000");
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
