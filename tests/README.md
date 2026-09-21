# Tests

Regression checks for the codefrag plugin.

## `fragment-map.mjs`

Renders `example.qmd`, loads the deck in a headless browser, and asserts every annotated or line-highlighted slide produces the expected fragment map (fragment index plus a label for each annotation and highlight step).

Run from the project root:

```bash
node tests/fragment-map.mjs
```

Skip the render step if `index.html` is already up to date:

```bash
node tests/fragment-map.mjs --no-render
```

## `check-warnings.mjs`

Loads `failing-bugs.html` and asserts the validation warnings emitted by `parseFragmentIndices` for non-numeric `code-annotation-fragment-indices` and `code-line-fragment-indices` tokens are visible in the browser console.

The fixture is `failing-bugs.qmd`, in this directory.
It renders through the `_quarto.yml` project beside it, which copies the extension in before the render and removes the copy afterwards.
Quarto looks for `_extensions` in the directory of the file it renders, and that copy is how it finds the `codefrag` plugin.

Render the fixture first, then run the check from the project root:

```bash
quarto render tests
node tests/check-warnings.mjs
```

## `check-no-errors.mjs`

Loads `../index.html`, walks every fragment forward then backward, and asserts no `console.error` was emitted.
Run after `quarto render example.qmd`:

```bash
node tests/check-no-errors.mjs
```

## Requirements

- `quarto` on `PATH` (for the renders).
- Puppeteer available in one of:
  - the module specifier `puppeteer` (`npm install -g puppeteer`),
  - the path pointed to by `$PUPPETEER_PATH`,
  - the puppeteer bundled with `decktape` (Homebrew or npm global install).

## Updating the snapshot

When the expected output legitimately changes (e.g. after adding a slide to `example.qmd` or changing fragment semantics), update the `EXPECTED` object at the top of `fragment-map.mjs`.
The test compares only annotation fragments and line-highlight clones; text and container fragments are intentionally ignored.
