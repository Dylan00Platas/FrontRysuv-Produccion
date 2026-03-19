import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:443",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err) => console.log("proxy error", err));
        },
      },
    },
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "./ssl/server.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "./ssl/server.crt")),
    },
    host: true,
    port: 443,
  },
});
