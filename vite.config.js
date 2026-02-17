import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // This section fixes the "Blocked request" error
  preview: {
    allowedHosts: [
      "whiteboard.nniit.com",// Matches your specific DO domain
    ],
    host: "0.0.0.0", // Ensures it listens on all IPs (required for Docker/Cloud)
    port: 8080,      // Ensures it runs on the port DO expects
  },
  build: {
    chunkSizeWarningLimit: 2000, // Increased because we're letting Vite handle chunking
  },
});
