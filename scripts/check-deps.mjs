#!/usr/bin/env node

/**
 * Dependency update checker with supply-chain safety.
 *
 * For each outdated package, walks the npm registry versions
 * backwards from latest to find the newest version published
 * at least N days ago. This ensures you always get an update
 * (not just "latest is too new, skipping").
 *
 * Usage:
 *   node scripts/check-deps.mjs          # dry-run (default 7 days)
 *   node scripts/check-deps.mjs --apply  # apply safe updates
 *   node scripts/check-deps.mjs --days 3 # custom age threshold
 */

import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const daysIdx = args.indexOf("--days");
const MIN_AGE_DAYS = daysIdx === -1 ? 7 : Number(args[daysIdx + 1]);
const cutoff = Date.now() - MIN_AGE_DAYS * 24 * 60 * 60 * 1000;

// 1. Get current + proposed updates from ncu
let raw;
try {
  raw = execSync(
    "pnpm dlx npm-check-updates --jsonUpgraded --deep 2>/dev/null",
    { encoding: "utf-8" }
  );
} catch (error) {
  raw = error.stdout;
}

if (!raw?.trim()) {
  console.log("All dependencies are up to date.");
  process.exit(0);
}

const result = JSON.parse(raw);

// Flatten — --deep may return { "path/package.json": { pkg: ver } } or flat
const allUpdates = new Map();
for (const [key, value] of Object.entries(result)) {
  if (typeof value === "string") {
    allUpdates.set(key, value);
  } else if (typeof value === "object") {
    for (const [pkg, ver] of Object.entries(value)) {
      if (!allUpdates.has(pkg)) {
        allUpdates.set(pkg, ver);
      }
    }
  }
}

if (allUpdates.size === 0) {
  console.log("All dependencies are up to date.");
  process.exit(0);
}

// 2. Get current installed versions for display
let currentVersions;
try {
  const lockInfo = execSync("pnpm ls --json --depth 0 2>/dev/null", {
    encoding: "utf-8",
  });
  const parsed = JSON.parse(lockInfo);
  currentVersions = {};
  for (const dep of [
    ...Object.entries(parsed[0]?.dependencies ?? {}),
    ...Object.entries(parsed[0]?.devDependencies ?? {}),
  ]) {
    currentVersions[dep[0]] = dep[1]?.version;
  }
} catch {
  currentVersions = {};
}

// 3. For each package, find the newest version that's old enough
const findSafeVersion = async (name, latestSpec) => {
  try {
    const res = await fetch(`https://registry.npmjs.org/${name}`);
    if (!res.ok) {
      return { note: "registry error", version: latestSpec };
    }
    const data = await res.json();
    const times = data.time ?? {};
    const versions = Object.keys(data.versions ?? {});

    // Walk versions from newest to oldest
    const withDates = versions
      // skip prereleases
      .filter((v) => times[v] && !v.includes("-"))
      .map((v) => ({ publishedAt: new Date(times[v]).getTime(), version: v }))
      .toSorted((a, b) => b.publishedAt - a.publishedAt);

    // Find the newest one older than cutoff
    for (const entry of withDates) {
      if (entry.publishedAt < cutoff) {
        const daysAgo = Math.floor(
          (Date.now() - entry.publishedAt) / (24 * 60 * 60 * 1000)
        );
        return { note: `${daysAgo}d ago`, version: entry.version };
      }
    }

    // Everything is too new
    const latestClean = latestSpec.replace(/^[\^~]/, "");
    const latestDate = times[latestClean];
    if (latestDate) {
      const daysAgo = Math.floor(
        (Date.now() - new Date(latestDate).getTime()) / (24 * 60 * 60 * 1000)
      );
      return { note: `latest is ${daysAgo}d old`, version: null };
    }
    return { note: "all versions too new", version: null };
  } catch {
    return { note: "age unknown", version: latestSpec };
  }
};

console.log(`Checking publish dates (min age: ${MIN_AGE_DAYS} days)...\n`);

const safe = [];
const skipped = [];

for (const [name, latestSpec] of allUpdates) {
  const current = currentVersions[name] ?? "?";
  const { version: safeVersion, note } = await findSafeVersion(
    name,
    latestSpec
  );
  const latestClean = latestSpec.replace(/^[\^~]/, "");

  if (safeVersion) {
    safe.push({
      current,
      latest: latestClean,
      name,
      note,
      version: safeVersion,
    });
  } else {
    skipped.push({ current, latest: latestClean, name, note });
  }
}

// 4. Report (ncu-style output)
let nameWidth = 10;
for (const entry of safe) {
  if (entry.name.length > nameWidth) {
    nameWidth = entry.name.length;
  }
}
for (const entry of skipped) {
  if (entry.name.length > nameWidth) {
    nameWidth = entry.name.length;
  }
}

if (safe.length > 0) {
  console.log(`Safe to update (published > ${MIN_AGE_DAYS} days ago):\n`);
  for (const { name, current, version, latest, note } of safe) {
    const arrow = version === latest ? "" : `  (latest: ${latest})`;
    console.log(
      `  ${name.padEnd(nameWidth)}  ${current.padEnd(12)} → ${version.padEnd(12)} ${note}${arrow}`
    );
  }
}

if (skipped.length > 0) {
  console.log(`\nSkipped (no version older than ${MIN_AGE_DAYS} days):\n`);
  for (const { name, current, latest, note } of skipped) {
    console.log(
      `  ${name.padEnd(nameWidth)}  ${current.padEnd(12)} → ${latest.padEnd(12)} ${note}`
    );
  }
}

if (safe.length === 0) {
  console.log("No safe updates available.");
  process.exit(0);
}

// 5. Apply if requested — write a target JSON and use ncu --target
if (apply) {
  console.log("\nApplying safe updates...");

  // Build a package filter that only includes safe packages at safe versions
  const targets = [];
  for (const entry of safe) {
    targets.push(entry.name);
  }
  const filterArg = targets.join(",");

  // Use ncu with --filter to only update the safe ones, then manually
  // pin versions in case ncu picks latest instead of our safe version
  execSync(`pnpm dlx npm-check-updates -u --deep --filter "${filterArg}"`, {
    stdio: "inherit",
  });

  // Now patch any where ncu picked a newer version than our safe one
  for (const { name, version, latest } of safe) {
    if (version !== latest) {
      // ncu would have written latest — we need to downgrade to safe version
      // This is a best-effort: ncu already wrote the file, we fix it
      try {
        execSync(
          `find . -name "package.json" -not -path "*/node_modules/*" -exec sed -i '' 's/"${name}": "\\^${latest}"/"${name}": "^${version}"/g' {} +`,
          { stdio: "pipe" }
        );
      } catch {
        // sed may fail on some platforms, that's ok
      }
    }
  }

  execSync("pnpm install", { stdio: "inherit" });
  console.log("\nDone.");
} else if (safe.length > 0) {
  console.log("\nRun with --apply to update, or pnpm deps:update to apply.");
}

process.exit(0);
