import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    clean: true,
    deps: {
      alwaysBundle: [/@ultimate-ts-starter\/.*/u],
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
    },
    // tsdown 0.23 (Vite+ 1.x): the default lazy dts pass drops `import type`
    // from bundled workspace sources and fails with MISSING_EXPORT; eager works.
    dts: { eager: true },
    entry: "./src/index.ts",
    format: "esm",
    outDir: "./dist",
  },
});
