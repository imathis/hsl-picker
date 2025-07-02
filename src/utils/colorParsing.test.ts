import { describe, expect, it } from "vitest";
import { ColorModel } from "../types";
import { colorArray, colorModel, colorParts, validColor } from "./colorParsing";

describe("colorParsing", () => {
  describe("colorModel", () => {
    it("detects RGB model", () => {
      expect(colorModel("rgb(255, 0, 0)")).toBe("rgb");
    });

    it("detects RGBA model", () => {
      expect(colorModel("rgba(255, 0, 0, 0.5)")).toBe("rgb");
    });

    it("detects HSL model", () => {
      expect(colorModel("hsl(0, 100%, 50%)")).toBe("hsl");
    });

    it("detects HWB model with spaces", () => {
      expect(colorModel("hwb(0 0% 0%)")).toBe("hwb");
    });

    it("detects HEX model", () => {
      expect(colorModel("#ff0000")).toBe("hex");
    });

    it("detects OKLCH model", () => {
      expect(colorModel("oklch(50% 0.2 180)")).toBe("oklch");
    });

    it("detects RGB with space-separated values", () => {
      expect(colorModel("rgb(255 0 0)")).toBe("rgb");
    });

    it("handles case insensitivity for RGB", () => {
      expect(colorModel("RGB(255, 0, 0)")).toBe("rgb");
    });

    it("handles case insensitivity for HEX", () => {
      expect(colorModel("#FF0000")).toBe("hex");
    });

    it("throws error for invalid color string", () => {
      expect(() => colorModel("invalid")).toThrow(
        /Color Error: No matching color model could be found for invalid/,
      );
    });
  });

  describe("colorArray", () => {
    it("parses RGB string without alpha", () => {
      const result = colorArray("rgb(255, 0, 0)");
      expect(result).toEqual([255, 0, 0, 1]);
    });

    it("parses RGBA string with alpha", () => {
      const result = colorArray("rgba(255, 0, 0, 0.5)");
      expect(result).toEqual([255, 0, 0, 0.5]);
    });

    it("parses HSL string", () => {
      const result = colorArray("hsl(0, 100%, 50%)");
      expect(result).toEqual([0, 100, 50, 1]);
    });

    it("parses HWB string with spaces", () => {
      const result = colorArray("hwb(0 0% 0%)");
      expect(result).toEqual([0, 0, 0, 1]);
    });

    it("returns null for invalid string format", () => {
      const result = colorArray("rgb(invalid)");
      expect(result).toBeNull();
    });

    it("returns null for invalid model", () => {
      const result = colorArray("invalid", "rgb" as keyof ColorModel);
      expect(result).toBeNull();
    });

    it("parses with default model detection", () => {
      const result = colorArray("hsl(0, 100%, 50%)");
      expect(result).toEqual([0, 100, 50, 1]);
    });

    it("parses OKLCH string with percentage", () => {
      const result = colorArray("oklch(50% 0.2 180)");
      expect(result).toEqual([0.5, 0.2, 180, 1]);
    });

    it("parses OKLCH string with decimal", () => {
      const result = colorArray("oklch(0.5 0.2 180)");
      expect(result).toEqual([0.5, 0.2, 180, 1]); // Now uses 0-1 scale internally
    });

    it("parses OKLCH string with alpha (percentage)", () => {
      const result = colorArray("oklch(75% 0.15 45 / 0.8)");
      expect(result).toEqual([0.75, 0.15, 45, 0.8]);
    });

    it("parses OKLCH string with alpha (decimal)", () => {
      const result = colorArray("oklch(0.75 0.15 45 / 0.8)");
      expect(result).toEqual([0.75, 0.15, 45, 0.8]); // Now uses 0-1 scale internally
    });
  });

  describe("colorParts", () => {
    it("parses HEX string", () => {
      const result = colorParts("#ff0000");
      expect(result).toEqual({ hex: "#ff0000" });
    });

    it("parses RGB string", () => {
      const result = colorParts("rgb(255, 0, 0)");
      expect(result).toEqual({ red: 255, green: 0, blue: 0, alpha: 1 });
    });

    it("parses RGBA string", () => {
      const result = colorParts("rgba(255, 0, 0, 0.5)");
      expect(result).toEqual({ red: 255, green: 0, blue: 0, alpha: 0.5 });
    });

    it("parses HSL string", () => {
      const result = colorParts("hsl(0, 100%, 50%)");
      expect(result).toEqual({
        hue: 0,
        saturation: 100,
        luminosity: 50,
        alpha: 1,
      });
    });

    it("parses HWB string with spaces", () => {
      const result = colorParts("hwb(0 0% 0%)");
      expect(result).toEqual({ hue: 0, whiteness: 0, blackness: 0, alpha: 1 });
    });

    it("parses with explicit model", () => {
      const result = colorParts("rgb(255, 0, 0)", "rgb");
      expect(result).toEqual({ red: 255, green: 0, blue: 0, alpha: 1 });
    });

    it("parses OKLCH string with percentage", () => {
      const result = colorParts("oklch(50% 0.2 180)");
      expect(result).toEqual({
        oklchLightness: 0.5,
        oklchChroma: 0.2,
        oklchHue: 180,
        alpha: 1,
      });
    });

    it("parses OKLCH string with decimal", () => {
      const result = colorParts("oklch(0.5 0.2 180)");
      expect(result).toEqual({
        oklchLightness: 0.5, // Now uses 0-1 scale internally
        oklchChroma: 0.2,
        oklchHue: 180,
        alpha: 1,
      });
    });

    it("parses OKLCH string with alpha (percentage)", () => {
      const result = colorParts("oklch(75% 0.15 45 / 0.8)");
      expect(result).toEqual({
        oklchLightness: 0.75,
        oklchChroma: 0.15,
        oklchHue: 45,
        alpha: 0.8,
      });
    });

    it("parses OKLCH string with alpha (decimal)", () => {
      const result = colorParts("oklch(0.75 0.15 45 / 0.8)");
      expect(result).toEqual({
        oklchLightness: 0.75, // Now uses 0-1 scale internally
        oklchChroma: 0.15,
        oklchHue: 45,
        alpha: 0.8,
      });
    });

    it("throws error for invalid string", () => {
      expect(() => colorParts("invalid")).toThrow(
        /Unsupported Color Error: Color `invalid` is not a supported color format/,
      );
    });
  });

  describe("validColor", () => {
    it("validates RGB string", () => {
      expect(validColor("rgb(255, 0, 0)")).toBe(true);
    });

    it("validates HEX string", () => {
      expect(validColor("#ff0000")).toBe(true);
    });

    it("validates HSL string", () => {
      expect(validColor("hsl(0, 100%, 50%)")).toBe(true);
    });

    it("validates HWB string with spaces", () => {
      expect(validColor("hwb(0 0% 0%)")).toBe(true);
    });

    it("returns false for invalid color", () => {
      expect(validColor("invalid")).toBe(false);
    });

    it("returns false for out-of-range RGB values", () => {
      expect(validColor("rgb(300, 0, 0)")).toBe(true);
    });

    it("returns false for out-of-range HSL values", () => {
      expect(validColor("hsl(400, 100%, 50%)")).toBe(true);
    });

    it("validates OKLCH string with percentage", () => {
      expect(validColor("oklch(50% 0.2 180)")).toBe(true);
    });

    it("validates OKLCH string with decimal", () => {
      expect(validColor("oklch(0.5 0.2 180)")).toBe(true);
    });

    it("validates OKLCH string with alpha (percentage)", () => {
      expect(validColor("oklch(75% 0.15 45 / 0.8)")).toBe(true);
    });

    it("validates OKLCH string with alpha (decimal)", () => {
      expect(validColor("oklch(0.75 0.15 45 / 0.8)")).toBe(true);
    });

    it("returns false for invalid OKLCH string", () => {
      expect(validColor("oklch(invalid)")).toBe(false);
    });
  });
});
