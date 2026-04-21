import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    // Generated files are reformatted by their code generators
    arrowParens: "always",
    bracketSameLine: false,
    bracketSpacing: true,
    endOfLine: "lf",
    experimentalSortImports: {
      ignoreCase: true,
      newlinesBetween: true,
      order: "asc",
    },
    experimentalSortPackageJson: true,
    ignorePatterns: ["**/*.gen.*", "**/.content-collections/**"],
    jsxSingleQuote: false,
    printWidth: 80,
    quoteProps: "as-needed",
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
    useTabs: false,
  },
  lint: {
    extends: [
      // Core rules (was ultracite/oxlint core)
      {
        categories: {
          correctness: "error",
          pedantic: "error",
          perf: "error",
          restriction: "error",
          style: "error",
          suspicious: "error",
        },
        env: { browser: true },
        overrides: [
          {
            files: [
              "**/*.{test,spec}.{ts,tsx,js,jsx}",
              "**/__tests__/**/*.{ts,tsx,js,jsx}",
            ],
            rules: {
              "no-empty-function": "off",
              "promise/prefer-await-to-then": "off",
            },
          },
          {
            // Generated files — can't control style or naming
            files: ["**/*.gen.*"],
            rules: {
              "typescript/no-explicit-any": "off",
              "unicorn/filename-case": "off",
              "unicorn/no-abusive-eslint-disable": "off",
            },
          },
          {
            // Module augmentation requires empty interface extending the base type
            files: ["**/*.d.ts"],
            rules: {
              "typescript/no-empty-interface": "off",
              "typescript/no-empty-object-type": "off",
            },
          },
          {
            // TanStack Router convention: Route config at top references component defined below;
            // loaders use `throw redirect()` which throws a non-Error object
            files: ["**/routes/**/*.{ts,tsx}"],
            rules: {
              "no-use-before-define": "off",
              "typescript/only-throw-error": "off",
            },
          },
          {
            // Error boundaries require class components — render() can't be async
            files: ["**/error-boundary.{ts,tsx}"],
            rules: {
              "class-methods-use-this": "off",
              "func-style": "off",
              "react/no-set-state": "off",
              "react/state-in-constructor": "off",
              "typescript/promise-function-async": "off",
            },
          },
          {
            // Paraglide i18n outputs untyped JS — messages/runtime types don't resolve in the linter
            files: [
              "apps/web/src/components/**/*.{ts,tsx}",
              "apps/web/src/routes/**/*.{ts,tsx}",
            ],
            rules: {
              "typescript/no-unsafe-argument": "off",
              "typescript/no-unsafe-assignment": "off",
              "typescript/no-unsafe-call": "off",
              "typescript/no-unsafe-member-access": "off",
            },
          },
          {
            // OpenTUI types are not fully typed yet — many APIs return `any`
            files: ["apps/tui/**/*.{ts,tsx}"],
            rules: {
              "typescript/no-unsafe-argument": "off",
              "typescript/no-unsafe-assignment": "off",
              "typescript/no-unsafe-call": "off",
              "typescript/no-unsafe-member-access": "off",
              "typescript/no-unsafe-return": "off",
              "typescript/no-unsafe-type-assertion": "off",
              "typescript/promise-function-async": "off",
              "typescript/strict-boolean-expressions": "off",
            },
          },
          {
            // Metro bundler requires CJS (module.exports, require())
            files: ["**/metro.config.*"],
            rules: {
              "typescript/no-unsafe-argument": "off",
              "typescript/no-unsafe-assignment": "off",
              "typescript/no-unsafe-call": "off",
              "typescript/no-unsafe-member-access": "off",
              "typescript/no-unsafe-return": "off",
              "unicorn/prefer-module": "off",
            },
          },
          {
            // Utility scripts use untyped Node APIs (fetch JSON, process.argv)
            files: ["scripts/**/*.{js,mjs,ts}"],
            rules: {
              "typescript/no-unsafe-argument": "off",
              "typescript/no-unsafe-assignment": "off",
              "typescript/no-unsafe-call": "off",
              "typescript/no-unsafe-member-access": "off",
              "typescript/no-unsafe-return": "off",
              "typescript/no-unsafe-type-assertion": "off",
              "typescript/strict-boolean-expressions": "off",
            },
          },
          {
            // Playwright config uses require() and untyped APIs
            files: ["**/playwright.config.*"],
            rules: {
              "typescript/no-unsafe-assignment": "off",
              "typescript/no-unsafe-call": "off",
              "typescript/no-unsafe-member-access": "off",
              "typescript/strict-boolean-expressions": "off",
              "unicorn/prefer-module": "off",
            },
          },
          {
            // Durable Object lifecycle methods are instance callbacks defined by the runtime
            files: ["**/durable-objects/**/*.ts"],
            rules: {
              "class-methods-use-this": "off",
            },
          },
        ],
        plugins: [
          "eslint",
          "typescript",
          "unicorn",
          "oxc",
          "import",
          "jsdoc",
          "node",
          "promise",
        ],
        rules: {
          "arrow-body-style": ["error", "as-needed"],
          "capitalized-comments": "off",
          "func-style": ["error", "expression", { allowArrowFunctions: true }],
          "id-length": "off",
          "import/consistent-type-specifier-style": [
            "error",
            "prefer-top-level",
          ],
          "import/exports-last": "off",
          "import/extensions": "off",
          // Env loading and wrangler re-exports must come before other imports
          "import/first": "off",
          "import/group-exports": "off",
          "import/max-dependencies": "off",
          "import/no-anonymous-default-export": "off",
          "import/no-commonjs": "off",
          "import/no-default-export": "off",
          "import/no-dynamic-require": "off",
          "import/no-named-export": "off",
          "import/no-namespace": "off",
          "import/no-nodejs-modules": "off",
          "import/no-relative-parent-imports": "error",
          "import/no-unassigned-import": "off",
          "import/prefer-default-export": "off",
          "import/unambiguous": "off",
          "init-declarations": "off",
          "jsdoc/require-param": "off",
          "jsdoc/require-param-type": "off",
          "jsdoc/require-returns": "off",
          "jsdoc/require-returns-type": "off",
          "max-depth": "off",
          "max-lines": "off",
          "max-lines-per-function": "off",
          "max-params": "off",
          "max-statements": "off",
          "new-cap": "off",
          "no-await-in-loop": "off",
          "no-console": "off",
          "no-continue": "off",
          "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
          "no-implicit-coercion": "off",
          "no-magic-numbers": "off",
          "no-ternary": "off",
          "no-undefined": "off",
          "no-void": ["error", { allowAsStatement: true }],
          // Starter template uses TODO comments as intentional guidance markers for fork users
          "no-warning-comments": "off",
          "node/no-process-env": "off",
          "oxc/no-async-await": "off",
          "oxc/no-map-spread": "off",
          "oxc/no-optional-chaining": "off",
          "oxc/no-rest-spread-properties": "off",
          "promise/always-return": "off",
          "promise/catch-or-return": "off",
          // oRPC interceptors and similar framework APIs use callback patterns that can't be promisified
          "promise/prefer-await-to-callbacks": "off",
          // Conflicts with the formatter's experimentalSortImports which sorts by path
          "sort-imports": "off",
          "typescript/explicit-function-return-type": "off",
          "typescript/explicit-module-boundary-types": "off",
          "typescript/no-explicit-any": "error",
          // Fires on async event handlers in React which are standard practice
          "typescript/no-misused-promises": "off",
          "typescript/no-require-imports": "off",
          "typescript/no-var-requires": "off",
          // Framework callback params (Hono Context, Cloudflare Request, WebSocket,
          // React events, Zod Refinement ctx) aren't typed as Readonly upstream.
          // Enforcing this would require hundreds of `as Readonly<…>` casts at every
          // boundary, with no real safety gain since the underlying types are mutable anyway.
          "typescript/prefer-readonly-parameter-types": "off",
          // Conflicts with require-await: this rule adds `async` to Promise-forwarding functions,
          // then require-await complains there's no `await` — can't satisfy both
          "typescript/promise-function-async": "off",
          "typescript/require-await": "off",
          "unicorn/explicit-length-check": "off",
          "unicorn/no-array-callback-reference": "off",
          "unicorn/no-null": "off",
          "unicorn/no-process-exit": "off",
          "unicorn/prefer-global-this": "off",
          "unicorn/prefer-string-raw": "off",
          "unicorn/prefer-top-level-await": "off",
          "unicorn/text-encoding-identifier-case": [
            "error",
            { withDash: true },
          ],
        },
      },
      // React rules (was ultracite/oxlint react)
      {
        plugins: ["react", "react-perf", "jsx-a11y"],
        rules: {
          // Label component spreads ...props (including htmlFor) — association is dynamic, not statically detectable
          "jsx-a11y/label-has-associated-control": "off",
          "jsx-a11y/no-autofocus": "off",
          "react-perf/jsx-no-jsx-as-prop": "off",
          "react-perf/jsx-no-new-array-as-prop": "off",
          // Memoizing every event handler is impractical; React Compiler optimizes this automatically
          "react-perf/jsx-no-new-function-as-prop": "off",
          "react-perf/jsx-no-new-object-as-prop": "off",
          "react/jsx-boolean-value": "off",
          "react/jsx-filename-extension": "off",
          "react/jsx-max-depth": "off",
          "react/jsx-props-no-spreading": "off",
          "react/no-multi-comp": "off",
          // Children.map is the correct API for staggered animation wrappers
          "react/no-react-children": "off",
          "react/no-unknown-property": "off",
          "react/only-export-components": "off",
          "react/react-in-jsx-scope": "off",
        },
      },
    ],
    ignorePatterns: [
      ".agents/**",
      ".claude/skills/**",
      ".goose/**",
      "packages/auth/Users/**",
      "**/.content-collections/**",
    ],
    options: {
      typeAware: true,
    },
  },
  staged: {
    "*": "vp check --fix",
  },
});
