/**
 * Console-noise smoke test for the rendered example.
 *
 * Loads ../index.html in a headless browser, steps through every fragment
 * on every slide (forward then backward), and asserts no `console.error`
 * was emitted. `console.warn` is allowed (Reveal.js sometimes warns about
 * deprecated options) but is printed for context.
 *
 * Run: `node tests/check-no-errors.mjs` from the project root.
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_HTML = resolve(PROJECT_ROOT, "index.html");

async function loadPuppeteer() {
  const tryPaths = [
    process.env.PUPPETEER_PATH,
    "puppeteer",
    "/opt/homebrew/lib/node_modules/decktape/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js",
    "/usr/local/lib/node_modules/decktape/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js",
    "/opt/homebrew/lib/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js",
    "/usr/local/lib/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js",
  ].filter(Boolean);
  for (const p of tryPaths) {
    try {
      const mod = await import(p);
      return mod.default ?? mod;
    } catch {}
  }
  throw new Error(
    "Could not resolve puppeteer. Install it globally (`npm install -g puppeteer`) " +
      "or set $PUPPETEER_PATH to the puppeteer entry module."
  );
}

if (!existsSync(INDEX_HTML)) {
  process.stderr.write(
    `index.html not found at ${INDEX_HTML}. Run \`quarto render example.qmd\` first.\n`
  );
  process.exit(1);
}

const puppeteer = await loadPuppeteer();
const browser = await puppeteer.launch({ headless: "new" });
const errors = [];
const warnings = [];
try {
  const page = await browser.newPage();
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error") errors.push(msg.text());
    else if (type === "warning" || type === "warn") warnings.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  await page.setViewport({ width: 1050, height: 700 });
  await page.goto(`file://${INDEX_HTML}`, { waitUntil: "networkidle0" });
  await page.waitForFunction(
    () => typeof Reveal !== "undefined" && Reveal.isReady()
  );

  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    Reveal.slide(0, 0, 0);
    await sleep(50);
    for (let i = 0; i < 250; i++) {
      Reveal.next();
      await sleep(15);
      if (Reveal.isLastSlide()) break;
    }
    for (let i = 0; i < 250; i++) {
      Reveal.prev();
      await sleep(15);
      if (Reveal.isFirstSlide()) break;
    }
  });
} finally {
  await browser.close();
}

if (errors.length > 0) {
  process.stderr.write(`FAIL: ${errors.length} console error(s):\n`);
  for (const e of errors) process.stderr.write(`  - ${e}\n`);
  process.exit(1);
}

process.stdout.write(
  `OK: no console errors. ${warnings.length} warning(s) (informational).\n`
);
for (const w of warnings) process.stdout.write(`  - ${w}\n`);
