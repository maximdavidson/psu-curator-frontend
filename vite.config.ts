import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  plugins: [
    react({
      include: ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js", "**/*.svg"]
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "PSU Curator",
        short_name: "Curator",
        description: "Приложение PSU Curator",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/appicon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/appicon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});
