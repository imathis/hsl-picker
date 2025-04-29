import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "./dist/stats.html", // Output file for the visualization
      open: true, // Automatically open the report in your browser
    }),
  ],
  build: {
    // Ensure source maps are enabled for better analysis
    sourcemap: true,
  },
});
