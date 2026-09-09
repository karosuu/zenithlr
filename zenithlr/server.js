"use strict";

/* global PhusionPassenger */

/**
 * Production entry for TMDHosting / cPanel (CloudLinux Node.js Selector + Passenger).
 * Local: keep using `npm run dev`. After `npm run build`, `npm start` uses this file.
 */

const { createServer } = require("http");
const fs = require("fs");
const path = require("path");
const next = require("next");

process.chdir(__dirname);

const dbFile = path.join(__dirname, "data", "db.json");
const dbExample = path.join(__dirname, "data", "db.example.json");
if (!fs.existsSync(dbFile) && fs.existsSync(dbExample)) {
  fs.copyFileSync(dbExample, dbFile);
}

const port = parseInt(process.env.PORT || "3000", 10);
const passenger =
  typeof PhusionPassenger !== "undefined" ? PhusionPassenger : null;

if (passenger) {
  passenger.configure({ autoInstall: false });
}

// server.js is the production entry. Never use `.next/dev` (leftover from Windows `next dev`).
process.env.NODE_ENV = "production";
const dev = false;

const app = next({
  dev,
  dir: path.join(__dirname),
  conf: { distDir: ".next" },
});
const handle = app.getRequestHandler();
const staticRoot = path.resolve(__dirname, ".next", "static");
const publicRoot = path.resolve(__dirname, "public");
const uploadDirs = [
  path.resolve(__dirname, "public", "uploads"),
  path.resolve(__dirname, "data", "uploads"),
];
const STATIC_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".json": "application/json",
  ".map": "application/json",
};

function sendBuildStatic(req, res) {
  const raw = (req.url || "").split("?")[0];
  if (!raw.startsWith("/_next/static/")) return false;

  let rel;
  try {
    rel = decodeURIComponent(raw.slice("/_next/static/".length));
  } catch {
    return false;
  }
  if (!rel || rel.includes("\0")) return false;

  const file = path.resolve(staticRoot, rel);
  if (file !== staticRoot && !file.startsWith(staticRoot + path.sep)) return false;

  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;

  res.statusCode = 200;
  res.setHeader(
    "Content-Type",
    STATIC_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
  );
  res.setHeader("Content-Length", String(stat.size));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  fs.createReadStream(file).pipe(res);
  return true;
}

function sendFile(file, res, cacheControl) {
  let info;
  try {
    info = fs.statSync(file);
  } catch {
    return false;
  }
  if (!info.isFile()) return false;

  res.statusCode = 200;
  res.setHeader(
    "Content-Type",
    STATIC_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
  );
  res.setHeader("Content-Length", String(info.size));
  res.setHeader("Cache-Control", cacheControl);
  fs.createReadStream(file).pipe(res);
  return true;
}

function sendUpload(req, res) {
  const raw = (req.url || "").split("?")[0];
  if (!raw.startsWith("/uploads/")) return false;

  let name;
  try {
    name = decodeURIComponent(raw.slice("/uploads/".length));
  } catch {
    return false;
  }
  if (!name || name.includes("\0") || name.includes("/") || name.includes("\\") || name.includes("..")) {
    return false;
  }
  if (path.basename(name) !== name) return false;

  for (const dir of uploadDirs) {
    const file = path.resolve(dir, name);
    if (file !== dir && !file.startsWith(dir + path.sep)) continue;
    if (sendFile(file, res, "public, max-age=86400")) return true;
  }
  return false;
}

function sendPublicFile(req, res) {
  const raw = (req.url || "").split("?")[0];
  if (!raw || raw === "/" || raw.startsWith("/api/") || raw.startsWith("/_next/") || raw.startsWith("/admin/")) {
    return false;
  }

  let rel;
  try {
    rel = decodeURIComponent(raw.replace(/^\//, ""));
  } catch {
    return false;
  }
  if (!rel || rel.includes("\0") || rel.includes("..")) return false;

  const file = path.resolve(publicRoot, rel);
  if (file !== publicRoot && !file.startsWith(publicRoot + path.sep)) return false;

  return sendFile(file, res, "public, max-age=86400");
}

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      if (sendBuildStatic(req, res)) return;
      if (sendUpload(req, res)) return;
      if (sendPublicFile(req, res)) return;
      handle(req, res).catch((err) => {
        console.error("[zenith] request error", req.url, err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      });
    });

    const onListen = () => {
      console.log(
        passenger
          ? "Zenith Luxury Realty ready (Passenger / TMDHosting, production)"
          : `Zenith Luxury Realty ready on port ${port}`,
      );
    };

    if (passenger) {
      server.listen("passenger", onListen);
    } else {
      server.listen(port, onListen);
    }
  })
  .catch((err) => {
    console.error("[zenith] failed to start", err);
    process.exit(1);
  });
