import { describe, it, expect } from 'vitest';
import { generateOklchGradient } from './gradientUtils';

describe('UI Integration Tests', () => {
  it('should test actual function calls from the UI', () => {
    // These are the exact values that would come from the store and UI
    const lightness = 66.2; // oklch format (0.662 * 100)
    const chroma = 0.278;
    const hue = 348;
    const showP3 = true; // store default
    const gamutGaps = true; // store default
    const steps = 72; // improved steps count
    
    // This is the EXACT call that happens from updateOklchGradients in the UI
    const gradient = generateOklchGradient(lightness, chroma, hue, 'hue', steps, showP3, gamutGaps);
    
    // Check for P3 colors that should be included
    const hasP3Colors = gradient.includes('145'); // Known P3-only green
    
    // Extract all hues
    const hueMatches = gradient.match(/oklch\([^)]+\s([0-9]+)\)/g);
    if (hueMatches) {
      const hues = hueMatches
        .map(match => {
          const hueMatch = match.match(/oklch\([^)]+\s([0-9]+)\)/);
          return hueMatch ? parseInt(hueMatch[1]) : null;
        })
        .filter(h => h !== null && h !== 0) // Filter out black sections and 0
        .filter((h, i, arr) => arr.indexOf(h) === i) // Remove duplicates
        .sort((a, b) => a - b);
      
      // Test for important color ranges
      const greenHues = hues.filter(h => h >= 140 && h <= 150);
      
      // This test MUST pass for the UI to show P3 colors correctly
      expect(greenHues.length).toBeGreaterThan(0);
    }
    
    // This is the key test - must contain P3 colors for UI to display them
    expect(hasP3Colors).toBe(true);
  });
  
  it('should verify step size captures important hues', () => {
    const testStepSizes = [36, 72]; // 36 was missing colors, 72 should catch them
    
    testStepSizes.forEach(steps => {
      // Generate sample positions around target hue 145°
      const positions = [];
      for (let i = 0; i <= steps; i++) {
        const hue = (i / steps) * 360;
        if (hue >= 140 && hue <= 150) {
          positions.push(hue);
        }
      }
      
      const includes145 = positions.includes(145);
      
      // 72 steps should capture 145°, 36 steps should not
      if (steps === 72) {
        expect(includes145).toBe(true);
      } else if (steps === 36) {
        expect(includes145).toBe(false);
      }
    });
  });
  
  it('should verify improved step count includes more colors', () => {
    const lightness = 66.2;
    const chroma = 0.278;
    const hue = 348;
    
    // Test with improved step count
    const gradientImproved = generateOklchGradient(lightness, chroma, hue, 'hue', 72, true, true);
    const hasImportantColors = gradientImproved.includes('145');
    
    // Also verify it's significantly different from coarser version
    const gradientCoarse = generateOklchGradient(lightness, chroma, hue, 'hue', 36, true, true);
    const hasImportantColorsCoarse = gradientCoarse.includes('145');
    
    // The improvement should be measurable
    expect(hasImportantColors).toBe(true);
    expect(hasImportantColorsCoarse).toBe(false);
    expect(hasImportantColors).not.toBe(hasImportantColorsCoarse);
  });
});