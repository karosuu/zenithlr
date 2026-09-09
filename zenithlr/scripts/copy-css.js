"use strict";

const fs = require("fs");
const path = require("path");

const cssDir = path.join(__dirname, "..", ".next", "static", "css");
const outFile = path.join(__dirname, "..", "public", "zenith.css");

if (!fs.existsSync(cssDir)) {
  console.warn("[copy-css] no .next/static/css directory");
  process.exit(0);
}

const css = fs.readdirSync(cssDir).find((name) => name.endsWith(".css"));
if (!css) {
  console.warn("[copy-css] no css file found");
  process.exit(0);
}

fs.copyFileSync(path.join(cssDir, css), outFile);
console.log(`[copy-css] wrote public/zenith.css from ${css}`);
