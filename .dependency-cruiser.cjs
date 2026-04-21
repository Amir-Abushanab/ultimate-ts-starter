/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      comment: "No circular dependencies allowed",
      from: {},
      name: "no-circular",
      severity: "error",
      to: { circular: true },
    },
    {
      comment: "Warn about files not imported by anything",
      from: {
        orphan: true,
        pathNot: ["\\.d\\.ts$", "\\.test\\.", "\\.spec\\.", "index\\.ts$"],
      },
      name: "no-orphans",
      severity: "warn",
      to: {},
    },
    {
      comment: "Apps must not import from other apps directly",
      from: { path: "^apps/([^/]+)/" },
      name: "apps-no-cross-import",
      severity: "error",
      to: { path: "^apps/(?!\\1)" },
    },
    {
      comment:
        "Packages should be imported via workspace aliases, not relative paths",
      from: { path: "^(apps|packages)/" },
      name: "packages-via-workspace",
      severity: "warn",
      to: { path: "^packages/", pathNot: "node_modules" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    enhancedResolveOptions: {
      conditionNames: ["import", "require", "node", "default"],
      exportsFields: ["exports"],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
    tsConfig: { fileName: "packages/config/tsconfig.base.json" },
    tsPreCompilationDeps: true,
  },
};
