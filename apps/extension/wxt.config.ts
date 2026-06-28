import babel from "@rolldown/plugin-babel";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  // React Compiler — @vitejs/plugin-react v6 dropped the inline babel option, so
  // it runs via @rolldown/plugin-babel + reactCompilerPreset, same as apps/web.
  // target "19" matches React 19.2.
  vite: async () => {
    const reactCompiler = await babel({
      presets: [reactCompilerPreset({ target: "19" })],
    });
    return {
      // eslint-disable-next-line typescript/no-unsafe-type-assertion, typescript/no-explicit-any, typescript/no-unsafe-assignment -- @rolldown/plugin-babel's Plugin type overflows TS's comparison vs WXT's config (TS2321), like the cloudflare plugin in apps/web
      plugins: [reactCompiler as any],
    };
  },
});
