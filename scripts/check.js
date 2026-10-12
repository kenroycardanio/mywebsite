"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LIVE_FILES = ["index.html", "styles.css", "site.js", "sample-id-sheet.svg", "ken-photo.png"];
const REMOVED_ROOT_FILES = [
  "CORE_VALUES.md",
  "COLLABORATION.md",
  "SHOWCASE_LIBRARY.md",
  "PAGE_COPY.md"
];

const errors = [];
const notes = [];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

for (const file of LIVE_FILES) {
  if (!exists(file)) errors.push("Live site file missing: " + file);
  else notes.push("live file present: " + file);
}

const html = exists("index.html") ? read("index.html") : "";
const css = exists("styles.css") ? read("styles.css") : "";
const js = exists("site.js") ? read("site.js") : "";
const svg = exists("sample-id-sheet.svg") ? read("sample-id-sheet.svg") : "";
const liveBundle = [html, css, js, svg].join("\n");

const localAssets = [];
const attrRe = /(?:href|src)="([^"]+)"/g;
let match;
while ((match = attrRe.exec(html))) {
  const url = match[1];
  if (/^(https?:|data:|mailto:|tel:|#)/i.test(url)) continue;
  localAssets.push(url.split("?")[0]);
}

const cssUrlRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
while ((match = cssUrlRe.exec(css))) {
  const url = match[1];
  if (/^(https?:|data:|#|%23)/i.test(url)) continue;
  localAssets.push(url.split("?")[0]);
}

for (const asset of localAssets) {
  if (!exists(asset)) errors.push("Missing asset referenced by the live page: " + asset);
  else notes.push("referenced asset exists: " + asset);
}

const ids = new Set();
const idRe = /\sid="([^"]+)"/g;
while ((match = idRe.exec(html))) ids.add(match[1]);

const hrefHashRe = /href="#([^"]+)"/g;
while ((match = hrefHashRe.exec(html))) {
  const id = match[1];
  if (!id) {
    errors.push("Empty internal anchor href=\"#\"");
    continue;
  }
  if (!ids.has(id)) errors.push("Unresolved internal anchor: #" + id);
  else notes.push("anchor resolves: #" + id);
}

for (const name of REMOVED_ROOT_FILES) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("(?:^|[\\s\"'`(/])" + escaped + "(?:$|[\\s\"'`)])");
  if (re.test(liveBundle)) {
    errors.push("Live site still references removed root file: " + name);
  }
  if (exists(name)) {
    errors.push("Removed root file still present at repo root: " + name);
  }
}

function looksLikeAiaLogo(url) {
  return /\.(?:png|jpe?g|gif|svg|webp|ico)(?:$|\?)/i.test(url) && /aia|philam/i.test(url);
}

const imageRefRe = /(?:href|src)="([^"]+)"/gi;
while ((match = imageRefRe.exec(html))) {
  if (looksLikeAiaLogo(match[1])) errors.push("AIA logo image referenced: " + match[1]);
}

const cssImageRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
while ((match = cssImageRe.exec(css))) {
  if (looksLikeAiaLogo(match[1])) errors.push("AIA logo image referenced in CSS: " + match[1]);
}

if (/<img\b[^>]*(?:aia|philam)/i.test(html)) {
  errors.push("AIA logo <img> found in index.html");
}

if (/<image\b[^>]*(?:aia|philam)/i.test(svg)) {
  errors.push("AIA logo image found in sample-id-sheet.svg");
}

for (const line of notes) console.log("ok   " + line);
if (errors.length) {
  for (const line of errors) console.error("fail " + line);
  process.exit(1);
}
console.log("check passed");
