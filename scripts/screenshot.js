"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "screenshots");
const HOST = "127.0.0.1";
const PORT = Number(process.env.SCREENSHOT_PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
      const file = path.normalize(path.join(ROOT, rel));
      if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        res.end();
        return;
      }
      fs.readFile(file, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        res.writeHead(200, {
          "Content-Type": MIME[path.extname(file)] || "application/octet-stream"
        });
        res.end(data);
      });
    });
    server.once("error", reject);
    server.listen(PORT, HOST, () => resolve(server));
  });
}

async function shot(page, width, height, filename) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto("http://" + HOST + ":" + PORT + "/", {
    waitUntil: "networkidle0",
    timeout: 60000
  });
  const dest = path.join(OUT_DIR, filename);
  await page.screenshot({
    path: dest,
    clip: { x: 0, y: 0, width, height }
  });
  console.log("wrote " + dest);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const page = await browser.newPage();
    await shot(page, 390, 844, "phone-390x844.png");
    await shot(page, 1280, 800, "desktop-1280x800.png");
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
