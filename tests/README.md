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

### Requirements

- `quarto` on `PATH`.
- Puppeteer available in one of:
  - the module specifier `puppeteer` (`npm install -g puppeteer`),
  - the path pointed to by `$PUPPETEER_PATH`,
  - the puppeteer bundled with `decktape` (Homebrew or npm global install).

### Updating the snapshot

When the expected output legitimately changes (e.g. after adding a slide to `example.qmd` or changing fragment semantics), update the `EXPECTED` object at the top of `fragment-map.mjs`.
The test compares only annotation fragments and line-highlight clones; text and container fragments are intentionally ignored.
