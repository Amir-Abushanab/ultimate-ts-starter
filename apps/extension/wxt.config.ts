import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  react: {
    vite: {
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    },
  },
});
