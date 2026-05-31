# Changelog

## Unreleased

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
