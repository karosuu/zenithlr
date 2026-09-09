"use strict";

/**
 * Pack a coherent production artifact for TMDHosting.
 * Run after `npm run build`. Does not include node_modules, db.json, uploads, or env files.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const outName = "zenith-deploy.tar.gz";
const outFile = path.join(root, outName);
const nextDir = path.join(root, ".next");

const required = [
  ".next",
  "server.js",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "messages",
  "src",
  "public",
];

if (!fs.existsSync(nextDir)) {
  console.error("[pack-production] Missing .next — run npm run build first");
  process.exit(1);
}

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`[pack-production] Missing required path: ${rel}`);
    process.exit(1);
  }
}

const zenithCss = path.join(root, "public", "zenith.css");
if (!fs.existsSync(zenithCss)) {
  console.error(
    "[pack-production] Missing public/zenith.css — build should run scripts/copy-css.js",
  );
  process.exit(1);
}

for (const junk of ["cache", "dev"]) {
  const dir = path.join(nextDir, junk);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`[pack-production] removed .next/${junk}`);
  }
}

if (fs.existsSync(outFile)) {
  fs.unlinkSync(outFile);
}

const entries = [
  ".next",
  "server.js",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "messages",
  "src",
  "public",
];

const optional = ["data/db.example.json", "postcss.config.mjs", "tsconfig.json"];
for (const rel of optional) {
  if (fs.existsSync(path.join(root, rel))) {
    entries.push(rel);
  }
}

const args = [
  "-czf",
  outName,
  "--exclude=public/uploads",
  "--exclude=.next/cache",
  "--exclude=.next/dev",
  ...entries,
];

const result = spawnSync("tar", args, {
  cwd: root,
  stdio: "inherit",
});

if (result.error) {
  console.error("[pack-production] Failed to run tar:", result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`[pack-production] tar exited with code ${result.status}`);
  process.exit(result.status || 1);
}

const bytes = fs.statSync(outFile).size;
const mb = (bytes / (1024 * 1024)).toFixed(2);
console.log(`[pack-production] wrote ${outName} (${mb} MB)`);
console.log(
  "[pack-production] excludes: node_modules, data/db.json, public/uploads, .env*",
);
