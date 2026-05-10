import { defineConfig } from "astro/config";

// To switch to the custom domain kironatomtellian.com:
//   1. Drop a file at apps/public/public/CNAME containing: kironatomtellian.com
//   2. Change `site` below to "https://kironatomtellian.com" and `base` to "/"
//   3. Point your DNS A records at GitHub Pages (185.199.108.153 / .154 / .155 / .156)
export default defineConfig({
  output: "static",
  site: "https://kironatomtellian.github.io",
  base: "/website",
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
