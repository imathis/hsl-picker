import { describe, it, expect } from 'vitest';
import { generateOklchGradient } from './gradientUtils';
import { inGamut } from 'culori';

describe('OKLCH Gradient Generation', () => {
  describe('Basic Gradient Generation', () => {
    it('should generate smooth gradients when gamutGaps is false', () => {
      const gradient = generateOklchGradient(50, 0.2, 180, 'hue', 10, true, false);
      
      // Should be a continuous gradient with no gaps
      expect(gradient.includes('oklch(0.2 0 0)')).toBe(false);
      expect(gradient.includes('linear-gradient')).toBe(true);
    });

    it('should generate gradients with gaps when gamutGaps is true', () => {
      const gradient = generateOklchGradient(66.2, 0.278, 348, 'hue', 72, true, true);
      
      // Should contain gap sections (black) for out-of-gamut colors
      expect(gradient.includes('oklch(0.2 0 0)')).toBe(true);
      expect(gradient.includes('linear-gradient')).toBe(true);
    });

    it('should vary the correct component in each gradient type', () => {
      const lightnessGradient = generateOklchGradient(50, 0.2, 180, 'lightness', 5, true, false);
      const chromaGradient = generateOklchGradient(50, 0.2, 180, 'chroma', 5, true, false);
      const hueGradient = generateOklchGradient(50, 0.2, 180, 'hue', 5, true, false);

      // Lightness should vary first parameter (0.0 to 1.0)
      expect(lightnessGradient).toMatch(/oklch\(0\.000.*oklch\(0\.[2-8].*oklch\(1\.000/);
      
      // Chroma should vary second parameter  
      expect(chromaGradient).toMatch(/oklch\(0\.500 0\.000.*oklch\(0\.500 0\.0[0-9]/);
      
      // Hue should vary third parameter
      expect(hueGradient).toMatch(/oklch\(0\.500 0\.200 0\).*oklch\(0\.500 0\.200 [0-9]/);
    });
  });

  describe('Gamut Checking', () => {
    it('should respect sRGB-only gamut when showP3 is false', () => {
      const sRGBGradient = generateOklchGradient(66.2, 0.278, 348, 'hue', 72, false, true);
      
      // Extract valid color stops (non-black)
      const colorStops = (sRGBGradient.match(/oklch\([^)]+\)/g) || [])
        .filter(stop => !stop.includes('oklch(0.2 0 0)'));
      
      // Should have fewer colors when limited to sRGB
      expect(colorStops.length).toBeLessThan(20);
    });

    it('should include P3 colors when showP3 is true', () => {
      const p3Gradient = generateOklchGradient(66.2, 0.278, 348, 'hue', 72, true, true);
      const sRGBGradient = generateOklchGradient(66.2, 0.278, 348, 'hue', 72, false, true);
      
      // Extract valid color stops from each
      const p3Colors = (p3Gradient.match(/oklch\([^)]+\)/g) || [])
        .filter(stop => !stop.includes('oklch(0.2 0 0)'));
      const sRGBColors = (sRGBGradient.match(/oklch\([^)]+\)/g) || [])
        .filter(stop => !stop.includes('oklch(0.2 0 0)'));
      
      // P3 should include more colors than sRGB-only
      expect(p3Colors.length).toBeGreaterThan(sRGBColors.length);
    });

    it('should correctly identify in-gamut colors', () => {
      // Test a low-chroma color that should be in sRGB
      const sRGBColor = { mode: 'oklch' as const, l: 0.5, c: 0.05, h: 180 };
      expect(inGamut('rgb')(sRGBColor)).toBe(true);
      expect(inGamut('p3')(sRGBColor)).toBe(true);

      // Test a high-chroma color that should only be in P3
      const p3OnlyColor = { mode: 'oklch' as const, l: 0.662, c: 0.278, h: 145 };
      expect(inGamut('rgb')(p3OnlyColor)).toBe(false);
      expect(inGamut('p3')(p3OnlyColor)).toBe(true);
    });
  });

  describe('Step Size and Precision', () => {
    it('should capture important hue values with sufficient step count', () => {
      // With 72 steps (5° increments), should capture hue 145°
      const gradient72 = generateOklchGradient(66.2, 0.278, 348, 'hue', 72, true, true);
      expect(gradient72.includes('145')).toBe(true);

      // With 36 steps (10° increments), might miss hue 145°
      const gradient36 = generateOklchGradient(66.2, 0.278, 348, 'hue', 36, true, true);
      // This documents the limitation of coarser steps
      expect(gradient36.includes('145')).toBe(false);
    });

    it('should generate more color stops with higher step counts', () => {
      const coarse = generateOklchGradient(50, 0.2, 180, 'hue', 10, true, false);
      const fine = generateOklchGradient(50, 0.2, 180, 'hue', 50, true, false);

      const coarseStops = (coarse.match(/oklch\(/g) || []).length;
      const fineStops = (fine.match(/oklch\(/g) || []).length;

      expect(fineStops).toBeGreaterThan(coarseStops);
    });
  });

  describe('OKLAB Interpolation for Lightness', () => {
    it('should use OKLAB interpolation for lightness gradients in smooth mode', () => {
      const lightness = generateOklchGradient(66.2, 0.278, 348, 'lightness', 10, true, false);
      
      // Should generate a gradient (we can't easily test OKLAB vs OKLCH from the output,
      // but we can verify it generates a reasonable gradient)
      expect(lightness.includes('linear-gradient')).toBe(true);
      expect(lightness.includes('oklch(')).toBe(true);
      
      // Should have multiple stops
      const stops = (lightness.match(/oklch\(/g) || []).length;
      expect(stops).toBeGreaterThan(5);
    });

    it('should maintain consistent hue in lightness gradients', () => {
      const lightness = generateOklchGradient(66.2, 0.278, 348, 'lightness', 5, true, false);
      
      // All color stops should maintain the same hue (348) and chroma (0.278)
      const matches = lightness.match(/oklch\([^)]+\)/g);
      if (matches) {
        matches.forEach(stop => {
          if (!stop.includes('0.2 0 0')) { // Skip gap sections
            expect(stop).toMatch(/oklch\([0-9.]+ 0\.278 348\)/);
          }
        });
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero chroma colors', () => {
      const gradient = generateOklchGradient(50, 0, 180, 'chroma', 10, true, true);
      expect(gradient.includes('linear-gradient')).toBe(true);
    });

    it('should handle invalid hue values gracefully', () => {
      const gradient = generateOklchGradient(50, 0.2, NaN, 'hue', 10, true, true);
      expect(gradient.includes('linear-gradient')).toBe(true);
      // Should default invalid hue to 0
      expect(gradient.includes(' 0)')).toBe(true);
    });

    it('should handle colors with no valid gamut range', () => {
      // Very high chroma that might be out of gamut everywhere
      const gradient = generateOklchGradient(50, 0.8, 180, 'hue', 10, false, true);
      
      // Should still generate a gradient, even if mostly gaps
      expect(gradient.includes('linear-gradient')).toBe(true);
    });
  });
});