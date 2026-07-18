#!/usr/bin/env node
/**
 * lint:tokens — enforce the design system's color contract.
 *
 * Colors live in ONE place: `@ultimate-ts-starter/theme` (tokens.css / index.ts).
 * Design-system surfaces must style with semantic token classes (`bg-primary`,
 * `text-muted-foreground`, …) or Tailwind palette / opacity utilities
 * (`bg-black/10`, `from-purple-500`) — never raw hex, arbitrary-value color
 * utilities (`bg-[#abc]`), or raw color functions (`rgb()`/`hsl()`/`oklch()`).
 * That keeps every surface on the shared token pipeline, which is what makes
 * consistent styling survive at scale (and keeps agents on the rails).
 *
 * Genuine one-offs — brand logos, data-viz, gradients — opt out with a
 * `token-allow` comment on the same line.
 *
 * Scope: the token-governed surfaces below. Email/notification HTML, the
 * browser-extension template, and the TUI render in other contexts (no Tailwind
 * pipeline) and are intentionally out of scope.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const ROOTS = [
  "apps/web/src",
  "apps/native/app",
  "apps/native/components",
  "packages/ui/src",
];
const EXTS = new Set([".ts", ".tsx", ".css"]);
// `styles/` is the global/token-definition layer (sibling to @theme) — the one
// place composing raw color values is legitimate, so it's out of scope here.
const SKIP_DIRS = new Set(["node_modules", "dist", ".expo", "build", "styles"]);
const ALLOW = "token-allow";

// 3/6/8-digit hex color, or a raw CSS color function.
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/;
const COLOR_FN = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/i;

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) {
      continue;
    }
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      out.push(...walk(path));
    } else if (EXTS.has(extname(path))) {
      out.push(path);
    }
  }
  return out;
};

const violations = [];
for (const root of ROOTS) {
  let files;
  try {
    files = walk(root);
  } catch {
    // A root may be absent in a partial checkout.
    continue;
  }
  for (const file of files) {
    const lines = readFileSync(file, "utf-8").split("\n");
    // A `token-allow` comment suppresses matches from its line until the next
    // blank line, so an own-line comment above a value or block opts it out
    // (inline/trailing comments are banned repo-wide).
    let allowActive = false;
    for (const [index, line] of lines.entries()) {
      if (line.includes(ALLOW)) {
        allowActive = true;
        continue;
      }
      if (line.trim() === "") {
        allowActive = false;
        continue;
      }
      if (allowActive) {
        continue;
      }
      const hit = HEX.exec(line) ?? COLOR_FN.exec(line);
      if (hit) {
        violations.push({
          file,
          line: index + 1,
          match: hit[0],
          text: line.trim(),
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error(
    `\n✖ lint:tokens — ${violations.length} raw color(s) in design-system surfaces.\n` +
      `  Use a semantic token class or a value from @ultimate-ts-starter/theme.\n` +
      `  Genuine brand/one-off colors: add a \`token-allow\` comment on the line.\n`
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  →  ${v.match}\n      ${v.text}`);
  }
  process.exit(1);
}

console.log("✓ lint:tokens — no raw colors in design-system surfaces");
