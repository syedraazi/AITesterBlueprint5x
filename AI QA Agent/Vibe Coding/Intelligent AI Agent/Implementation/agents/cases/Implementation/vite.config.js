import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: fileURLToPath(new URL("./frontend", import.meta.url)),
  plugins: [react()],
  server: {
    port: 5183,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:3302"
    }
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});
