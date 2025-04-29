import { describe, it, expect } from "vitest";
import {
  trackBg,
  hslBg,
  hwbBg,
  rgbBg,
  rainbowBg,
  background,
} from "./gradientUtils";

describe("gradientUtils", () => {
  describe("trackBg", () => {
    it("generates a linear gradient with static props and alpha", () => {
      const result = trackBg({
        type: "hsl",
        steps: 2,
        props: ["0", "100%", "50%"],
        alpha: "0.5",
      });
      expect(result).toBe(
        "linear-gradient(to right, hsl(0 100% 50% / 0.5), hsl(0 100% 50% / 0.5), hsl(0 100% 50% / 0.5))",
      );
    });

    it("generates a linear gradient with functional props", () => {
      const result = trackBg({
        type: "rgb",
        steps: 2,
        props: [(v: number) => v * 255, "0", "0"],
        alpha: false,
      });
      expect(result).toBe(
        "linear-gradient(to right, rgb(0 0 0), rgb(255 0 0), rgb(510 0 0))",
      );
    });

    it("handles zero or negative steps gracefully", () => {
      const result = trackBg({
        type: "hsl",
        steps: 0,
        props: ["0", "100%", "50%"],
        alpha: false,
      });
      expect(result).toBe(
        "linear-gradient(to right, hsl(0 100% 50%), hsl(0 100% 50%))",
      );
    });

    it("uses default alpha when not false", () => {
      const result = trackBg({
        type: "hsl",
        steps: 1,
        props: ["0", "100%", "50%"],
      });
      expect(result).toBe(
        "linear-gradient(to right, hsl(0 100% 50% / var(--picker-alpha)), hsl(0 100% 50% / var(--picker-alpha)))",
      );
    });
  });

  describe("rainbowBg", () => {
    it("generates a rainbow gradient with 11 stops", () => {
      const result = rainbowBg();
      const stops = (result.match(/hsl\(/g) || []).length;
      expect(stops).toBe(11);
      expect(result).toMatch(
        /^linear-gradient\(to right, hsl\(0 calc\(clamp\(35, var\(--picker-saturation\), 60\) \* 1%\) calc\(clamp\(55, var\(--picker-luminosity\), 70\) \* 1%\)\),/,
      );
    });
  });

  describe("background", () => {
    describe("hsl model", () => {
      it("hue gradient varies from 0 to 360", () => {
        const result = background.hsl.hue;
        expect(result).toMatch(/^linear-gradient\(to right, hsl\(0 /);
        expect(result).toMatch(/hsl\(360 .*?\)$/);
        expect((result.match(/hsl\(/g) || []).length).toBe(361);
      });

      it("saturation gradient toggles between 0%, 50%, 100%", () => {
        const result = background.hsl.saturation;
        expect(result).toBe(
          "linear-gradient(to right, hsl(var(--picker-hue) 0% calc(var(--picker-luminosity) * 1%) / var(--picker-alpha)), hsl(var(--picker-hue) 50% calc(var(--picker-luminosity) * 1%) / var(--picker-alpha)), hsl(var(--picker-hue) 100% calc(var(--picker-luminosity) * 1%) / var(--picker-alpha)))",
        );
      });

      it("luminosity gradient steps through 0%, 16.67%, 33.33%, 50%", () => {
        const result = background.hsl.luminosity;
        expect(result).toBe(
          "linear-gradient(to right, hsl(var(--picker-hue) calc(var(--picker-saturation) * 1%) 0% / var(--picker-alpha)), hsl(var(--picker-hue) calc(var(--picker-saturation) * 1%) 16.67% / var(--picker-alpha)), hsl(var(--picker-hue) calc(var(--picker-saturation) * 1%) 33.33% / var(--picker-alpha)), hsl(var(--picker-hue) calc(var(--picker-saturation) * 1%) 50% / var(--picker-alpha)))",
        );
      });

      it("alpha gradient varies from 0 to 1", () => {
        const result = background.hsl.alpha;
        expect(result).toBe(
          "linear-gradient(to right, hsl(var(--picker-hue) calc(var(--picker-saturation) * 1%) calc(var(--picker-luminosity) * 1%) / 0), hsl(var(--picker-hue) calc(var(--picker-saturation) * 1%) calc(var(--picker-luminosity) * 1%) / 1))",
        );
      });
    });

    describe("hwb model", () => {
      it("hue gradient varies from 0 to 360", () => {
        const result = background.hwb.hue;
        expect(result).toMatch(/^linear-gradient\(to right, hwb\(0 /);
        expect(result).toMatch(/hwb\(360 .*?\)$/);
        expect((result.match(/hwb\(/g) || []).length).toBe(361);
      });

      it("whiteness gradient varies from 0% to 100%", () => {
        const result = background.hwb.whiteness;
        expect(result).toBe(
          "linear-gradient(to right, hwb(var(--picker-hue) 0% calc(var(--picker-blackness) * 1%) / var(--picker-alpha)), hwb(var(--picker-hue) 50% calc(var(--picker-blackness) * 1%) / var(--picker-alpha)), hwb(var(--picker-hue) 100% calc(var(--picker-blackness) * 1%) / var(--picker-alpha)))",
        );
      });

      it("blackness gradient varies from 0% to 100%", () => {
        const result = background.hwb.blackness;
        expect(result).toBe(
          "linear-gradient(to right, hwb(var(--picker-hue) calc(var(--picker-whiteness) * 1%) 0% / var(--picker-alpha)), hwb(var(--picker-hue) calc(var(--picker-whiteness) * 1%) 50% / var(--picker-alpha)), hwb(var(--picker-hue) calc(var(--picker-whiteness) * 1%) 100% / var(--picker-alpha)))",
        );
      });

      it("alpha gradient varies from 0 to 1", () => {
        const result = background.hwb.alpha;
        expect(result).toBe(
          "linear-gradient(to right, hwb(var(--picker-hue) calc(var(--picker-whiteness) * 1%) calc(var(--picker-blackness) * 1%) / 0), hwb(var(--picker-hue) calc(var(--picker-whiteness) * 1%) calc(var(--picker-blackness) * 1%) / 1))",
        );
      });
    });

    describe("rgb model", () => {
      it("red gradient varies from 0 to 255", () => {
        const result = background.rgb.red;
        expect(result).toMatch(/^linear-gradient\(to right, rgba\(0 /);
        expect(result).toMatch(
          /rgba\(255 var\(--picker-green\) var\(--picker-blue\) \/ var\(--picker-alpha\)\)\)$/,
        );
        expect((result.match(/rgba\(/g) || []).length).toBe(256);
      });

      it("green gradient varies from 0 to 255", () => {
        const result = background.rgb.green;
        expect(result).toMatch(
          /^linear-gradient\(to right, rgba\(var\(--picker-red\) 0 /,
        );
        expect(result).toMatch(
          /rgba\(var\(--picker-red\) 255 var\(--picker-blue\) \/ var\(--picker-alpha\)\)\)$/,
        );
        expect((result.match(/rgba\(/g) || []).length).toBe(256);
      });

      it("blue gradient varies from 0 to 255", () => {
        const result = background.rgb.blue;
        expect(result).toMatch(
          /^linear-gradient\(to right, rgba\(var\(--picker-red\) var\(--picker-green\) 0 /,
        );
        expect(result).toMatch(
          /rgba\(var\(--picker-red\) var\(--picker-green\) 255 \/ var\(--picker-alpha\)\)\)$/,
        );
        expect((result.match(/rgba\(/g) || []).length).toBe(256);
      });

      it("alpha gradient varies from 0 to 1", () => {
        const result = background.rgb.alpha;
        expect(result).toBe(
          "linear-gradient(to right, rgba(var(--picker-red) var(--picker-green) var(--picker-blue) / 0), rgba(var(--picker-red) var(--picker-green) var(--picker-blue) / 1))",
        );
      });
    });

    it("has the correct structure for HSL model", () => {
      expect(background.hsl).toHaveProperty("hue");
      expect(background.hsl).toHaveProperty("saturation");
      expect(background.hsl).toHaveProperty("luminosity");
      expect(background.hsl).toHaveProperty("alpha");
      expect(background.hsl.hue).toMatch(/^linear-gradient\(to right, hsl/);
    });

    it("has the correct structure for HWB model", () => {
      expect(background.hwb).toHaveProperty("hue");
      expect(background.hwb).toHaveProperty("whiteness");
      expect(background.hwb).toHaveProperty("blackness");
      expect(background.hwb).toHaveProperty("alpha");
      expect(background.hwb.whiteness).toMatch(
        /^linear-gradient\(to right, hwb/,
      );
    });

    it("has the correct structure for RGB model", () => {
      expect(background.rgb).toHaveProperty("red");
      expect(background.rgb).toHaveProperty("green");
      expect(background.rgb).toHaveProperty("blue");
      expect(background.rgb).toHaveProperty("alpha");
      expect(background.rgb.red).toMatch(/^linear-gradient\(to right, rgba/);
    });
  });
});
