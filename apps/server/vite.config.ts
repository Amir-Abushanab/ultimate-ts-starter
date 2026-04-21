import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    clean: true,
    entry: "./src/index.ts",
    format: "esm",
    noExternal: [/@ultimate-ts-starter\/.*/],
    outDir: "./dist",
  },
});
