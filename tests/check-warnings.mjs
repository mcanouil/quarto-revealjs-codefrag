/**
 * Smoke test for the parseFragmentIndices validation warnings.
 *
 * Loads ../failing-bugs.html in a headless browser, captures console
 * messages, and asserts the expected `[codefrag] Ignoring non-numeric`
 * warnings are emitted for both `code-annotation-fragment-indices` and
 * `code-line-fragment-indices`.
 *
 * Run: `node tests/check-warnings.mjs` from the project root.
 * Requires ../failing-bugs.html (produced by `quarto render failing-bugs.qmd`)
 * and puppeteer available via the same resolution rules as fragment-map.mjs.
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET_HTML = resolve(PROJECT_ROOT, "failing-bugs.html");

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

if (!existsSync(TARGET_HTML)) {
  process.stderr.write(
    `failing-bugs.html not found at ${TARGET_HTML}. Run \`quarto render failing-bugs.qmd\` first.\n`
  );
  process.exit(1);
}

const puppeteer = await loadPuppeteer();
const browser = await puppeteer.launch({ headless: "new" });
const warnings = [];
try {
  const page = await browser.newPage();
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "warning" || type === "warn") warnings.push(msg.text());
  });
  await page.setViewport({ width: 1050, height: 700 });
  await page.goto(`file://${TARGET_HTML}`, { waitUntil: "networkidle0" });
  await page.waitForFunction(
    () => typeof Reveal !== "undefined" && Reveal.isReady()
  );
} finally {
  await browser.close();
}

const expected = [
  /\[codefrag\] Ignoring non-numeric code-annotation-fragment-indices token: position 2 \("abc"\)\./,
  /\[codefrag\] Ignoring non-numeric code-line-fragment-indices token: position 3 \("foo"\)\./,
];

const missing = expected.filter((re) => !warnings.some((w) => re.test(w)));
if (missing.length > 0) {
  process.stderr.write("FAIL: expected warnings not emitted:\n");
  for (const re of missing) process.stderr.write(`  - ${re}\n`);
  process.stderr.write("\nCaptured warnings:\n");
  for (const w of warnings) process.stderr.write(`  - ${w}\n`);
  process.exit(1);
}

process.stdout.write(
  `OK: both expected validation warnings observed (${warnings.length} warnings total).\n`
);
