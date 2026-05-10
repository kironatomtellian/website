import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://kironatomtellian.com",
  trailingSlash: "never",
  build: {
    inlineStylesheets: "always",
    format: "file",
  },
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },
  vite: {
    build: {
      cssMinify: "esbuild",
    },
  },
});
