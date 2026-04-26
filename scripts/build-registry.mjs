// Builds registry-item JSON files for the shadcn-compatible component registry.
//
// Reads `registry.json` at the repo root, copies each component's source from
// packages/ui, rewrites its workspace-package imports into portable `@/` aliases
// that the consumer's shadcn CLI will resolve via their components.json, then
// writes one JSON per item plus an index to apps/web/public/r/.
//
// Why we don't shell out to `shadcn build`: that would require duplicating the
// component sources with portable imports. This script does the rewrite inline.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUTPUT = resolve(ROOT, "apps/web/public/r");

const registry = JSON.parse(
  readFileSync(resolve(ROOT, "registry.json"), "utf-8")
);

// Workspace package paths → portable shadcn aliases.
// `@/lib/utils` and `@/components/ui/*` get rewritten to the consumer's
// configured aliases by their `npx shadcn add` invocation.
const rewriteImports = (source) =>
  source
    .replaceAll(
      /from\s+"@ultimate-ts-starter\/ui\/lib\/utils"/g,
      'from "@/lib/utils"'
    )
    .replaceAll(/from\s+"\.\/button"/g, 'from "@/components/ui/button"')
    .replaceAll(/from\s+"\.\/card"/g, 'from "@/components/ui/card"')
    .replaceAll(/from\s+"\.\/skeleton"/g, 'from "@/components/ui/skeleton"');

mkdirSync(OUTPUT, { recursive: true });

const indexItems = [];
for (const item of registry.items) {
  const files = item.files.map((f) => ({
    content: rewriteImports(readFileSync(resolve(ROOT, f.path), "utf-8")),
    path: f.path,
    target: f.target,
    type: f.type,
  }));

  const itemJson = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    dependencies: item.dependencies ?? [],
    description: item.description,
    files,
    name: item.name,
    registryDependencies: item.registryDependencies ?? [],
    title: item.title,
    type: item.type,
  };

  writeFileSync(
    resolve(OUTPUT, `${item.name}.json`),
    `${JSON.stringify(itemJson, null, 2)}\n`
  );

  indexItems.push({
    description: item.description,
    name: item.name,
    title: item.title,
    type: item.type,
  });
}

const index = {
  $schema: registry.$schema,
  homepage: registry.homepage,
  items: indexItems,
  name: registry.name,
};
writeFileSync(
  resolve(OUTPUT, "registry.json"),
  `${JSON.stringify(index, null, 2)}\n`
);

console.log(`Built ${registry.items.length} registry items → ${OUTPUT}`);
