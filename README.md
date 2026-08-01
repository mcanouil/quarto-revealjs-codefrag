# Reveal.js Code Annotation Fragments Extension for Quarto

A Reveal.js plugin that turns Quarto code annotations into fragments, so they are stepped through with the arrow keys rather than arriving all at once.

Annotations synchronise with line highlighting where both are used, and the tooltips are repositioned so they are not clipped.

## Installation

```bash
quarto add mcanouil/quarto-revealjs-codefrag@1.1.1
```

This will install the extension under the `_extensions` subdirectory.
If you are using version control, you will want to check in this directory.

## Documentation

The full documentation lives at <https://m.canouil.dev/quarto-revealjs-codefrag/>: every option, the per-block fragment indices, the tooltip overflow fix, the callback, and a deck to step through.

[`example.qmd`](example.qmd) is a short, standalone starting point you can copy.

## Licence

[MIT](https://github.com/mcanouil/quarto-revealjs-codefrag?tab=MIT-1-ov-file#readme).
