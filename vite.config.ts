// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// If your React app is in /client, uncomment the "root" line below
// and make sure index.html is inside /client.
// root: "client",

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/client",   // <-- Express will serve this
    emptyOutDir: true
  },
  // If you used a /client root, also add:
  // root: "client",
});
