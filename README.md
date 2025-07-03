# A Most Excellent Color Picker

**🎨 [colorpicker.dev](https://colorpicker.dev) **

An advanced, open-source color picker supporting multiple color models with wide gamut support and precision color handling.

![Color Picker Screenshot](https://github.com/user-attachments/assets/8e7c38b6-59d3-4488-abb9-630dc91e00e6)

## ✨ Features

### 🌈 Multiple Color Models

All color models update in real-time as you adjust any slider, helping you understand how different color spaces relate to each other. Watch how adjusting HSL saturation affects HWB whiteness, or see how OKLCH's perceptual hue differs from HSL's mathematical hue. This live comparison makes it easy to understand when each color model works best.

- **OKLCH** - Wide gamut perceptual color space perfect for design systems. Access vibrant P3 display colors impossible in sRGB
- **HWB** - Intuitive whiteness and blackness mixing. Natural for adding white or black to pure hues
- **HSL** - Classic hue, saturation, and luminosity. Familiar and intuitive for quick color selection
- **HSV** - Hue, saturation, and value (brightness). Popular in graphics software, great for artists
- **RGB** - Direct red, green, blue channel control with alpha transparency
- **HEX** - Web standard supporting 3, 4, 6, and 8 character codes (with alpha support)

### 🎯 Smart Color Handling

- **Cross-format pasting** - Paste any color format into any input field
- **Auto-model detection** - Automatically enables the appropriate color picker
- **Precision preservation** - OKLCH colors maintain full precision without sRGB conversion
- **Gamut visualization** - See P3 vs sRGB differences with dual color swatches

## 🚀 Technology

Built with modern web technologies:

- **TypeScript & React** - Type-safe, reactive UI
- **Vite** - Lightning-fast development and builds
- **Zustand** - Lightweight state management with persistence
- **Culori** - Advanced color math and wide gamut support
- **CSS Variables** - Dynamic theming and gradients

## 🎓 Why This Color Picker?

### Wide Gamut Support

Unlike traditional color pickers limited to sRGB, this tool embraces **OKLCH** for accessing the full spectrum of modern displays. Pick electric blues and neon greens that were impossible with older color spaces.

## 🛠️ Development

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Run tests
bun test

# Build for production
bun build

# Preview production build
bun preview
```

---

## 📄 License

Copyright (c) 2011-2025 Brandon Mathis

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
