/**
 * Regression test for codefrag fragment-index assignment.
 *
 * Renders `example.qmd` (unless `--no-render` is passed), loads the deck
 * in a headless browser, and asserts the fragment map of every annotated
 * or line-highlighted slide matches the expected snapshot below.
 *
 * Run: `node tests/fragment-map.mjs` from the project root.
 * Requires `quarto` on PATH and puppeteer available in one of:
 *   - the module specifier `puppeteer` (global or local install)
 *   - `$PUPPETEER_PATH`
 *   - the puppeteer bundled with `decktape` (Homebrew or npm global)
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_HTML = resolve(PROJECT_ROOT, "index.html");
const EXAMPLE_QMD = resolve(PROJECT_ROOT, "example.qmd");

// Keys are `h/v` indices returned by `Reveal.getIndices`. They depend on
// slide order in `example.qmd`; adding, removing, or reordering slides will
// shift these keys and require updating the snapshot below.
const EXPECTED = {
  "2/1": [
    { index: "0", label: "annot-1" },
    { index: "1", label: "annot-2" },
    { index: "2", label: "annot-3" },
    { index: "3", label: "annot-4" },
    { index: "4", label: "annot-5" },
  ],
  "2/2": [
    { index: "0", label: "annot-1" },
    { index: "1", label: "annot-2" },
    { index: "2", label: "annot-3" },
    { index: "3", label: "annot-4" },
  ],
  "3/1": [
    { index: "0", label: "annot-1" },
    { index: "0", label: "highlight-lines=1" },
    { index: "1", label: "annot-2" },
    { index: "1", label: "highlight-lines=3-5" },
    { index: "2", label: "annot-3" },
    { index: "2", label: "highlight-lines=6" },
  ],
  "3/2": [
    { index: "0", label: "annot-2" },
    { index: "0", label: "highlight-lines=3-5" },
    { index: "1", label: "annot-3" },
    { index: "1", label: "highlight-lines=6" },
  ],
  "4/1": [
    { index: "3", label: "annot-1" },
    { index: "4", label: "annot-2" },
    { index: "5", label: "annot-3" },
  ],
  "4/2": [
    { index: "1", label: "annot-1" },
    { index: "2", label: "annot-2" },
    { index: "3", label: "annot-3" },
  ],
  "4/3": [
    { index: "4", label: "annot-1" },
    { index: "5", label: "annot-2" },
    { index: "6", label: "annot-3" },
  ],
  "5/1": [
    { index: "0", label: "highlight-lines=1" },
    { index: "1", label: "highlight-lines=3-4" },
    { index: "2", label: "highlight-lines=6" },
  ],
  "5/2": [
    { index: "0", label: "annot-1" },
    { index: "0", label: "highlight-lines=1" },
    { index: "1", label: "annot-2" },
    { index: "1", label: "highlight-lines=3-4" },
    { index: "2", label: "annot-3" },
    { index: "2", label: "highlight-lines=6" },
  ],
  "5/3": [
    { index: "1", label: "highlight-lines=2" },
    { index: "3", label: "highlight-lines=3" },
  ],
  "5/4": [
    { index: "1", label: "annot-1" },
    { index: "1", label: "highlight-lines=1" },
    { index: "3", label: "highlight-lines=3" },
    { index: "4", label: "annot-2" },
    { index: "4", label: "highlight-lines=5" },
  ],
  "5/5": [
    { index: "1", label: "annot-1" },
    { index: "1", label: "highlight-lines=1" },
    { index: "2", label: "highlight-lines=3" },
    { index: "3", label: "annot-2" },
    { index: "3", label: "highlight-lines=5" },
  ],
};

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

function renderExample() {
  if (!existsSync(EXAMPLE_QMD)) {
    throw new Error(`example.qmd not found at ${EXAMPLE_QMD}`);
  }
  const result = spawnSync("quarto", ["render", EXAMPLE_QMD], {
    cwd: PROJECT_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    throw new Error(`quarto render exited with status ${result.status}`);
  }
}

function collectActual(puppeteer) {
  return puppeteer.evaluate(() => {
    const slides = Reveal.getSlides();
    const map = {};
    for (const s of slides) {
      const hasAnnot = s.dataset.hasAnnotationFragments === "true";
      const hasLineHl = s.querySelector("code.fragment.has-line-highlights");
      if (!hasAnnot && !hasLineHl) continue;

      const fragments = [];
      for (const f of s.querySelectorAll(".fragment[data-fragment-index]")) {
        const index = f.getAttribute("data-fragment-index");
        let label = null;
        if (f.classList.contains("code-annotation-fragment")) {
          label = `annot-${f.dataset.targetAnnotation}`;
        } else if (
          f.tagName === "CODE" &&
          f.classList.contains("has-line-highlights")
        ) {
          label = `highlight-lines=${
            f.getAttribute("data-code-line-numbers") || "?"
          }`;
        } else {
          continue; // Text and container fragments are not asserted.
        }
        fragments.push({ index, label });
      }
      fragments.sort(
        (a, b) =>
          Number(a.index) - Number(b.index) || a.label.localeCompare(b.label)
      );

      const { h, v } = Reveal.getIndices(s);
      map[`${h}/${v}`] = fragments;
    }
    return map;
  });
}

function diff(expected, actual) {
  const fmt = (arr) => arr.map((f) => `[${f.index}] ${f.label}`).join("\n    ");
  const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  const failures = [];
  for (const key of [...keys].sort()) {
    const e = expected[key];
    const a = actual[key];
    if (!e) {
      failures.push(`+ ${key} (unexpected slide)\n    ${fmt(a)}`);
      continue;
    }
    if (!a) {
      failures.push(`- ${key} (missing slide)\n    ${fmt(e)}`);
      continue;
    }
    if (JSON.stringify(e) !== JSON.stringify(a)) {
      failures.push(
        `! ${key}\n  expected:\n    ${fmt(e)}\n  actual:\n    ${fmt(a)}`
      );
    }
  }
  return failures;
}

const args = new Set(process.argv.slice(2));
if (!args.has("--no-render")) {
  process.stdout.write("Rendering example.qmd...\n");
  renderExample();
}
if (!existsSync(INDEX_HTML)) {
  process.stderr.write(`index.html not found at ${INDEX_HTML}\n`);
  process.exit(1);
}

const puppeteer = await loadPuppeteer();
const browser = await puppeteer.launch({ headless: "new" });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1050, height: 700 });
  await page.goto(`file://${INDEX_HTML}`, { waitUntil: "networkidle0" });
  await page.waitForFunction(
    () => typeof Reveal !== "undefined" && Reveal.isReady()
  );
  const actual = await collectActual(page);
  const failures = diff(EXPECTED, actual);
  if (failures.length > 0) {
    process.stderr.write(
      `FAIL: ${failures.length} slide(s) did not match the expected fragment map.\n\n`
    );
    for (const f of failures) process.stderr.write(`${f}\n\n`);
    process.exit(1);
  }
  process.stdout.write(
    `OK: ${Object.keys(EXPECTED).length} slides matched the expected fragment map.\n`
  );
} finally {
  await browser.close();
}
