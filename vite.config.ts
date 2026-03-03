import fs from "fs";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "ssl/server.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "ssl/server.crt")),
    },
    host: true,
    port: 5173,
  },
});
