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

const dev = process.env.NODE_ENV === "development";
const port = parseInt(process.env.PORT || "3000", 10);
const passenger =
  typeof PhusionPassenger !== "undefined" ? PhusionPassenger : null;

if (passenger) {
  passenger.configure({ autoInstall: false });
}

const app = next({
  dev,
  dir: path.join(__dirname),
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
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
          ? "Zenith Luxury Realty ready (Passenger / TMDHosting)"
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
