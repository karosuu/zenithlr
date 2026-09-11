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

try {
  const pub = path.join(__dirname, "public");
  const lines = [
    new Date().toISOString(),
    `dirname=${__dirname}`,
    `cwd=${process.cwd()}`,
    `publicExists=${fs.existsSync(pub)}`,
    `zenithCss=${fs.existsSync(path.join(pub, "zenith.css"))}`,
    `publicFiles=${fs.existsSync(pub) ? fs.readdirSync(pub).join("|") : ""}`,
  ];
  fs.mkdirSync(path.join(__dirname, "tmp"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "tmp", "zenith-boot.log"), `${lines.join("\n")}\n`);
} catch (err) {
  console.error("[zenith] boot log failed", err);
}

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
  ".css": "text/css",
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

function isInside(root, file) {
  return file === root || file.startsWith(root + path.sep);
}

function resolveExistingFile(file) {
  try {
    const info = fs.statSync(file);
    if (info.isFile()) return file;
  } catch {
    /* missing */
  }
  return null;
}

/** If an old CSS hash is requested after a deploy, serve the current build CSS. */
function resolveCssFallback(requestedFile) {
  const cssDir = path.join(staticRoot, "css");
  if (!isInside(cssDir, requestedFile) || path.extname(requestedFile).toLowerCase() !== ".css") {
    return null;
  }
  try {
    const match = fs
      .readdirSync(cssDir)
      .filter((name) => name.endsWith(".css"))
      .map((name) => path.join(cssDir, name))
      .find((file) => resolveExistingFile(file));
    return match || null;
  } catch {
    return null;
  }
}

function sendDiskFile(file, res, cacheControl) {
  const existing = resolveExistingFile(file);
  if (!existing) return false;

  try {
    const data = fs.readFileSync(existing);
    res.statusCode = 200;
    res.setHeader(
      "Content-Type",
      STATIC_TYPES[path.extname(existing).toLowerCase()] || "application/octet-stream",
    );
    res.setHeader("Content-Length", String(data.length));
    res.setHeader("Cache-Control", cacheControl);
    res.end(data);
    return true;
  } catch (err) {
    console.error("[zenith] static read failed", existing, err);
    return false;
  }
}

function requestPath(req) {
  let raw = req.url || "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      raw = new URL(raw).pathname + (new URL(raw).search || "");
    }
  } catch {
    /* keep raw */
  }
  return raw.split("?")[0];
}

function sendBuildStatic(req, res) {
  const raw = requestPath(req);
  if (!raw.startsWith("/_next/static/")) return false;

  let rel;
  try {
    rel = decodeURIComponent(raw.slice("/_next/static/".length));
  } catch {
    return false;
  }
  if (!rel || rel.includes("\0") || rel.includes("..")) return false;

  const file = path.resolve(staticRoot, rel);
  if (!isInside(staticRoot, file)) return false;

  // Always prefer disk for CSS so deploy hash mismatches cannot 404 the admin.
  if (rel.startsWith("css/") || rel.endsWith(".css")) {
    const cssFile =
      resolveExistingFile(file) ||
      resolveCssFallback(file) ||
      resolveExistingFile(path.join(publicRoot, "zenith.css"));
    if (cssFile && sendDiskFile(cssFile, res, "public, max-age=60")) return true;
  }

  if (sendDiskFile(file, res, "public, max-age=31536000, immutable")) return true;

  const cssFallback = resolveCssFallback(file);
  if (cssFallback && sendDiskFile(cssFallback, res, "public, max-age=60")) return true;

  return false;
}

function sendFile(file, res, cacheControl) {
  return sendDiskFile(file, res, cacheControl);
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

  const cacheControl =
    rel === "deploy-marker.txt" ? "no-store" : "public, max-age=86400";
  return sendFile(file, res, cacheControl);
}

function sendStableCss(req, res) {
  const raw = requestPath(req);
  if (raw !== "/zenith.css" && raw !== "/api/site-css") return false;

  const cssFile =
    resolveExistingFile(path.join(publicRoot, "zenith.css")) ||
    resolveCssFallback(path.join(staticRoot, "css", "app.css"));
  if (!cssFile) return false;
  return sendDiskFile(cssFile, res, "public, max-age=60");
}

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      if (sendStableCss(req, res)) return;
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
