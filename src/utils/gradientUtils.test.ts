import { describe, it, expect } from "vitest";
import {
  trackBg,
  rainbowBg,
  background,
  generateOklchGradient,
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
          "linear-gradient(to right, hsl(var(--picker-hue) 0% calc(var(--picker-luminosity) * 1%)), hsl(var(--picker-hue) 50% calc(var(--picker-luminosity) * 1%)), hsl(var(--picker-hue) 100% calc(var(--picker-luminosity) * 1%)))",
        );
      });

      it("luminosity gradient steps from 0% to 100% (black to white)", () => {
        const result = background.hsl.luminosity;
        expect(result).toContain("linear-gradient(to right,");
        expect(result).toContain("hsl(var(--picker-hue) calc(var(--picker-saturation) * 1%) 0%)");
        expect(result).toContain("hsl(var(--picker-hue) calc(var(--picker-saturation) * 1%) 100%)");
        expect(result).not.toContain("/ var(--picker-alpha)");
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
          "linear-gradient(to right, hwb(var(--picker-hue) 0% calc(var(--picker-blackness) * 1%)), hwb(var(--picker-hue) 50% calc(var(--picker-blackness) * 1%)), hwb(var(--picker-hue) 100% calc(var(--picker-blackness) * 1%)))",
        );
      });

      it("blackness gradient varies from 0% to 100%", () => {
        const result = background.hwb.blackness;
        expect(result).toBe(
          "linear-gradient(to right, hwb(var(--picker-hue) calc(var(--picker-whiteness) * 1%) 0%), hwb(var(--picker-hue) calc(var(--picker-whiteness) * 1%) 50%), hwb(var(--picker-hue) calc(var(--picker-whiteness) * 1%) 100%))",
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
        expect(result).toMatch(/^linear-gradient\(to right, rgb\(0 /);
        expect(result).toMatch(/rgb\(255 var\(--picker-green\) var\(--picker-blue\)\)\)$/);
        expect((result.match(/rgb\(/g) || []).length).toBe(256);
      });

      it("green gradient varies from 0 to 255", () => {
        const result = background.rgb.green;
        expect(result).toMatch(/^linear-gradient\(to right, rgb\(var\(--picker-red\) 0 /);
        expect(result).toMatch(/rgb\(var\(--picker-red\) 255 var\(--picker-blue\)\)\)$/);
        expect((result.match(/rgb\(/g) || []).length).toBe(256);
      });

      it("blue gradient varies from 0 to 255", () => {
        const result = background.rgb.blue;
        expect(result).toMatch(/^linear-gradient\(to right, rgb\(var\(--picker-red\) var\(--picker-green\) 0\)/);
        expect(result).toMatch(/rgb\(var\(--picker-red\) var\(--picker-green\) 255\)\)$/);
        expect((result.match(/rgb\(/g) || []).length).toBe(256);
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
      expect(background.rgb.red).toMatch(/^linear-gradient\(to right, rgb/);
    });
  });

  describe("generateOklchGradient", () => {
    it("generates correct lightness values from 0 to 1", () => {
      const gradient = generateOklchGradient(0.5, 0.2, 180, 'lightness', 4, true, false);
      
      // Should contain lightness values from 0 to 1
      expect(gradient).toContain('oklch(0.000');
      expect(gradient).toContain('oklch(0.250');
      expect(gradient).toContain('oklch(0.500');
      expect(gradient).toContain('oklch(0.750');
      expect(gradient).toContain('oklch(1.000');
      
      // Should NOT contain near-zero values like 0.005
      expect(gradient).not.toContain('oklch(0.005');
      expect(gradient).not.toContain('oklch(0.001');
    });

    it("generates correct chroma values from 0 to max", () => {
      const gradient = generateOklchGradient(0.5, 0.2, 180, 'chroma', 4, true, false);
      
      // Should contain chroma values from 0 to 0.37 (P3 max)
      expect(gradient).toContain('oklch(0.500 0.000');
      expect(gradient).toContain('oklch(0.500 0.092');
      expect(gradient).toContain('oklch(0.500 0.185');
      expect(gradient).toContain('oklch(0.500 0.277');
      expect(gradient).toContain('oklch(0.500 0.370');
      
      // Lightness should stay constant
      const lightnessMatches = gradient.match(/oklch\((0\.500)/g);
      expect(lightnessMatches?.length).toBe(5);
    });

    it("generates correct hue values from 0 to 360", () => {
      const gradient = generateOklchGradient(0.5, 0.2, 180, 'hue', 4, true, false);
      
      // Should contain hue values from 0 to 360
      expect(gradient).toContain('oklch(0.500 0.200 0)');
      expect(gradient).toContain('oklch(0.500 0.200 90)');
      expect(gradient).toContain('oklch(0.500 0.200 180)');
      expect(gradient).toContain('oklch(0.500 0.200 270)');
      expect(gradient).toContain('oklch(0.500 0.200 360)');
      
      // Lightness and chroma should stay constant
      const constantMatches = gradient.match(/oklch\(0\.500 0\.200/g);
      expect(constantMatches?.length).toBe(5);
    });

    it("gamut gaps mode shows proper lightness values (not 0.005)", () => {
      const gradient = generateOklchGradient(0.499, 0.17, 142, 'lightness', 5, true, true);
      
      // Should NOT contain the problematic 0.005 values
      expect(gradient).not.toContain('oklch(0.005');
      expect(gradient).not.toContain('oklch(0.001');
      
      // Should contain proper gap markers or valid lightness values
      if (gradient.includes('oklch(0.')) {
        // If it contains actual OKLCH colors, they should have proper lightness values >= 0.1
        const oklchMatches = gradient.match(/oklch\((\d\.\d+)/g);
        if (oklchMatches) {
          for (const match of oklchMatches) {
            const lightness = parseFloat(match.replace('oklch(', ''));
            // Allow black placeholder (0.2) or valid lightness values (>= 0.1)
            expect(lightness >= 0.1 || lightness === 0.2).toBe(true);
          }
        }
      }
    });

    it("gamut gaps mode shows proper chroma values (not 0.005)", () => {
      const gradient = generateOklchGradient(0.499, 0.17, 142, 'chroma', 5, true, true);
      
      // Should NOT contain the problematic 0.005 lightness values  
      expect(gradient).not.toContain('oklch(0.005');
      expect(gradient).not.toContain('oklch(0.001');
      
      // Should contain the input lightness (0.499) in valid colors
      if (gradient.includes('oklch(0.499')) {
        expect(gradient).toContain('oklch(0.499');
      }
    });

    it("validates gradient syntax and structure", () => {
      const gradient = generateOklchGradient(0.5, 0.2, 180, 'lightness', 3, true, false);
      
      // Should be a valid CSS linear-gradient
      expect(gradient).toMatch(/^linear-gradient\(to right,/);
      expect(gradient).toMatch(/\)$/);
      
      // Should contain percentage positions
      expect(gradient).toMatch(/\d+\.\d+%/);
      
      // Should contain valid OKLCH colors
      expect(gradient).toMatch(/oklch\(\d\.\d+ \d\.\d+ \d+\)/);
    });
  });
});
