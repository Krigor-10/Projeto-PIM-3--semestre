import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const versaoImpressao = fs.readFileSync(
  path.resolve(__dirname, "src/impressao/versao-impressao.html"),
  "utf-8"
);

export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      minify: false,
      inject: {
        data: { versaoImpressao },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
