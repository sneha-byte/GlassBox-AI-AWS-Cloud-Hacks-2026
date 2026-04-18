import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // The frontend is intentionally minimal, so the default React plugin plus
  // a fixed dev port is enough for local development.
  plugins: [react()],
  server: {
    port: 5173,
  },
});
