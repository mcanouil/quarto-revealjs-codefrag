# Changelog

## Unreleased

### Documentation

- docs: Serve the extension's social card as the Open Graph image, so a shared link shows the card rather than the first image on the page. (#18)

### Refactoring

- build: Update the vendored Lua modules to 2.3.0, which includes the `schema-check` fix for an extension whose entry points are in a subdirectory. A module no longer carries a version line in its header, so its checksum changes only when its code changes. (#19)
- build: Fetch the schema validator from a Quarto Wizard release asset rather than a raw path inside its repository, which a refactor could move without notice. The vendored file is unchanged. (#20)

## 1.2.0 (2026-09-07)

### New Features

- feat: Check the document configuration against the extension schema and report what it does not accept. The deck must name `codefrag` under `filters:` as well as under `revealjs-plugins:` for the check to run. (#14)

## 1.1.1 (2026-08-01)

### Documentation

- docs: Add a documentation website under `docs/`, built on the `atelier` project type and published to <https://m.canouil.dev/quarto-revealjs-codefrag/>, including a deck to step through.
- docs: Trim `README.md` to a landing page pointing at the website.
- docs: Add the Pages workflow, which renders `docs/` on pull requests and deploys it from the release tag.
- docs: Add the Quarto Extensions Updates workflow, scanning `docs` for the website's own dependencies.

## 1.1.0 (2026-05-31)

### Bug Fixes

- fix: Skip `popperInstance.update()` when the anchor is detached between the synthetic `click()` and the deferred `requestAnimationFrame`, preventing a no-op error when slide changes interrupt tooltip mounting.
- fix: Emit a `console.warn` listing the offending position and raw token when `code-annotation-fragment-indices` or `code-line-fragment-indices` contains a non-numeric value, instead of silently leaving the affected slot unindexed.

### Features

- feat: Add `extensions.codefrag.patch-tooltip-overflow` (default `true`) to opt out of the tooltip `appendTo` patch and keep Quarto's default container.
- feat: Add `extensions.codefrag.on-annotation-shown` callback fired after every annotation tooltip is shown (live navigation and PDF export), receiving `{ anchor, slide, targetCell, targetAnnotation, tippy }`.
- feat: Detect overflow-clipping ancestors when patching tooltips; fall back to the slide `<section>` only when an inner container actually clips, otherwise leave Quarto's default `appendTo` in place so nested layouts (e.g. `::: {.columns}`) render with the natural anchor.
- feat: Document and demonstrate annotations inside nested containers in `example.qmd`.

### Documentation

- docs: Document the new options, the validation behaviour, and the nested-container support in `README.md`, `example.qmd`, and `_schema.yml`.

## 1.0.1 (2026-04-27)

### Bug Fixes

- fix: Patch tooltip `appendTo` on every show to escape `overflow: hidden` containers (e.g. `code-window`).

## 1.0.0 (2026-04-18)

- feat: Initial release.
