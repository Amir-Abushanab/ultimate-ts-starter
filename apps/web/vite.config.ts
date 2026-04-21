import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import tsconfigPaths from "vite-tsconfig-paths";

const root = resolve(import.meta.filename, "../../..");
const packageJson: unknown = JSON.parse(
  readFileSync(resolve(root, "package.json"), "utf-8")
);
const appVersion =
  typeof packageJson === "object" &&
  packageJson !== null &&
  "version" in packageJson &&
  typeof packageJson.version === "string"
    ? packageJson.version
    : "0.0.0";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    contentCollections(),
    tsconfigPaths(),
    paraglideVitePlugin({
      outdir: resolve(root, "packages/i18n/src/paraglide"),
      project: resolve(root, "packages/i18n/project.inlang"),
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
  ],
  server: {
    port: 3001,
  },
});
