import { describe, it, expect } from "vitest";
import {
  toString,
  rgbaToHex,
  toHslwb,
  toRgb,
  createColorObject,
} from "./colorConversion";
import { RGBColor, HSLColor, HWBColor, HEXColor, ColorModel } from "../types";

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

  describe("toHslwb", () => {
    it("converts RGB to HSL and HWB (red dominant)", () => {
      const rgb: RGBColor = { red: 255, green: 0, blue: 0 };
      const result = toHslwb(rgb);
      expect(result).toMatchObject({
        hue: 0,
        saturation: 100,
        luminosity: 50,
        whiteness: 0,
        blackness: 0,
        alpha: 1,
        hsl: "hsl(0 100% 50%)",
        hwb: "hwb(0 0% 0%)",
      });
    });

    it("converts RGB to HSL and HWB (achromatic/gray)", () => {
      const rgb: RGBColor = { red: 128, green: 128, blue: 128 };
      const result = toHslwb(rgb);
      expect(result).toMatchObject({
        hue: 0,
        saturation: 0,
        luminosity: 50,
        whiteness: 50,
        blackness: 50,
        alpha: 1,
        hsl: "hsl(0 0% 50%)",
        hwb: "hwb(0 50% 50%)",
      });
    });

    it("converts RGB to HSL and HWB with alpha", () => {
      const rgb: RGBColor = { red: 255, green: 0, blue: 0, alpha: 0.5 };
      const result = toHslwb(rgb);
      expect(result).toMatchObject({
        hue: 0,
        saturation: 100,
        luminosity: 50,
        whiteness: 0,
        blackness: 0,
        alpha: 0.5,
        hsl: "hsla(0 100% 50% / 0.5)",
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

    it("parses RGBA string", () => {
      const result = toRgb("rgba(255, 0, 0, 0.5)");
      expect(result).toMatchObject({
        red: 255,
        green: 0,
        blue: 0,
        alpha: 0.5,
        rgb: "rgba(255 0 0 / 0.5)",
        hex: "#ff000080",
      });
    });

    it("converts HEX string to RGB", () => {
      const result = toRgb("#ff0000");
      expect(result).toMatchObject({
        red: 255,
        green: 0,
        blue: 0,
        alpha: 1,
        rgb: "rgb(255 0 0)",
        hex: "#ff0000",
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
    });

    it("throws error for invalid color model detection", () => {
      expect(() => createColorObject("invalid")).toThrow(
        /Color Error: No matching color model could be found for invalid/,
      );
    });
  });
});
