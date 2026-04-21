import { defineWorkspace } from "vitest/config";

// eslint-disable-next-line typescript/no-unsafe-call -- defineWorkspace type unresolved in lint env
export default defineWorkspace([
  "apps/web/vitest.config.ts",
  {
    test: {
      environment: "node",
      include: ["packages/*/src/**/*.test.ts"],
      name: "packages",
    },
  },
]);
