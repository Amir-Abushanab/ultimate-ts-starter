// Release versioning for the monorepo.
//
// Usage: node scripts/release-version.mjs <patch|minor|major>
//
// Behavior:
//   1. If pending changesets exist in .changeset/, runs `pnpm changeset version`
//      so per-package versions + changelogs are generated.
//   2. Always bumps the root package.json version by the requested semver level.
//      The root version is the release/tag version for the whole monorepo.
//
// Writes `version=<next>` to $GITHUB_OUTPUT so the calling workflow can tag.

import { execSync } from "node:child_process";
import {
  appendFileSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const VALID_BUMPS = ["patch", "minor", "major"];

const bumpType = process.argv[2] ?? "minor";
if (!VALID_BUMPS.includes(bumpType)) {
  console.error(
    `Invalid bump: "${bumpType}". Expected one of: ${VALID_BUMPS.join(", ")}`
  );
  process.exit(1);
}

const rootDir = resolve(import.meta.dirname, "..");
const rootPkgPath = resolve(rootDir, "package.json");
const changesetDir = resolve(rootDir, ".changeset");

const pending = readdirSync(changesetDir).filter(
  (f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md"
);

if (pending.length > 0) {
  console.log(
    `Found ${pending.length} pending changeset(s) — running \`pnpm changeset version\``
  );
  execSync("pnpm changeset version", { cwd: rootDir, stdio: "inherit" });
  execSync("pnpm install --lockfile-only", { cwd: rootDir, stdio: "inherit" });
} else {
  console.log(`No pending changesets — bumping root only (${bumpType})`);
}

const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf-8"));
const [major, minor, patch] = rootPkg.version.split(".").map(Number);

let nextVersion;
if (bumpType === "major") {
  nextVersion = `${major + 1}.0.0`;
} else if (bumpType === "minor") {
  nextVersion = `${major}.${minor + 1}.0`;
} else {
  nextVersion = `${major}.${minor}.${patch + 1}`;
}

rootPkg.version = nextVersion;
writeFileSync(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`);

console.log(`Root version → ${nextVersion}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${nextVersion}\n`);
}
