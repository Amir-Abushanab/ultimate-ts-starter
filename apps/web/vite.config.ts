import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
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
    // Cloudflare plugin has a complex Plugin union that blows TS stack depth
    // when combined with the others — cast it individually to keep inference shallow.
    // eslint-disable-next-line typescript/no-unsafe-type-assertion, typescript/no-explicit-any, typescript/no-unsafe-assignment -- see above
    cloudflare({ viteEnvironment: { name: "ssr" } }) as any,
    contentCollections(),
    tsconfigPaths(),
    paraglideVitePlugin({
      outdir: resolve(root, "packages/i18n/src/paraglide"),
      project: resolve(root, "packages/i18n/project.inlang"),
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    // React Compiler — @vitejs/plugin-react v6 dropped the babel option, so it
    // runs via @rolldown/plugin-babel + reactCompilerPreset (auto-memoizes,
    // retiring manual useMemo/useCallback). target "19" matches React 19.2.
    babel({ presets: [reactCompilerPreset({ target: "19" })] }),
  ],
  server: {
    port: 3001,
  },
});
