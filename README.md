# Reveal.js Code Annotation Fragments Extension for Quarto

A Reveal.js plugin that enables fragment-based keyboard navigation through code annotations in Quarto presentations.
This extension creates invisible fragment triggers for each annotation, allowing you to step through annotations using arrow keys or space bar.

## Features

- **Fragment Navigation**: Code annotations are treated as fragments, enabling smooth keyboard-based navigation.
- **Tooltip Display**: Annotation tooltips (via tippy.js) appear automatically when fragments are revealed.
- **Line Highlight Sync**: When line highlighting is present, annotations synchronise with the highlighted lines.
- **Bidirectional Navigation**: Navigate forwards and backwards through annotations seamlessly.
- **Overflow Fix**: Tooltips are repositioned to avoid clipping by inner containers.
- **PDF Export Support**: Annotation markers are styled for print output.

## Installation

```bash
quarto add mcanouil/quarto-revealjs-codefrag@1.0.1
```

This will install the extension under the `_extensions` subdirectory.
If you are using version control, you will want to check in this directory.

## Usage

### Basic Setup

Add the plugin to your Reveal.js presentation:

```yaml
---
title: "My Presentation"
format:
  revealjs:
    code-annotations: select
revealjs-plugins:
  - codefrag
---
```

### Code Annotations

Use Quarto's native code annotation syntax.
The plugin automatically makes each annotation navigable as a fragment.

````markdown
```{.r}
library(dplyr)     # <1>

mtcars |>          # <2>
  filter(mpg > 20) # <3>
```

1. Load the dplyr package.
2. Start with the mtcars dataset.
3. Filter rows where mpg is greater than 20.
````

### Navigation

- Use **arrow keys** or **space bar** to step through annotations.
- Press **right arrow** or **space** to reveal the next annotation tooltip.
- Press **left arrow** to return to the previous annotation.
- Annotations are treated as fragments in the presentation flow.

### Custom Fragment Indices

Two code-block attributes let you control fragment ordering when interleaving annotations or highlight steps with other fragments on the slide.
Only the relative order of the values matters; Reveal.js compacts the indices after init, so `0,2,4,6` and `0,1,2,3` behave identically once any gaps have been absorbed by surrounding fragments.

Override the index of each annotation with `code-annotation-fragment-indices` (comma-separated, in annotation order):

````markdown
```{.r code-annotation-fragment-indices="2,4,6"}
library(dplyr)     # <1>
mtcars |>          # <2>
  filter(mpg > 20) # <3>
```
````

Override the index of each line-highlight step with `code-line-fragment-indices`.
The list starts with the original code (step 0) and covers every highlight step:

````markdown
```{.r code-line-numbers="|1|3|5" code-line-fragment-indices="1,2,4,6"}
x <- 1:10
y <- x^2
plot(x, y)
```
````

## How it Works

The plugin automatically:

1. Detects all annotated code blocks (`.code-annotation-code`) in your slides.
2. Creates invisible fragment elements for each annotation anchor.
3. Leaves fragment indices for Reveal.js to assign by DOM order, unless `code-annotation-fragment-indices` (or, for highlight steps, `code-line-fragment-indices`) specifies explicit values.
4. Listens to fragment events to show and hide annotation tooltips.
5. When line highlighting is present, matches annotations against highlight steps by line numbers so matched pairs share a navigation step and unmatched annotations follow the last highlight step on the slide.
6. On PDF export, clones annotated slides so each annotation appears on its own page with the correct tooltip rendered.

## Configuration

Configure the plugin in your presentation YAML:

```yaml
extensions:
  codefrag:
    enabled: true
```

### Options

| Option    | Type    | Default | Description                                       |
| --------- | ------- | ------- | ------------------------------------------------- |
| `enabled` | boolean | `true`  | Enable or disable annotation fragment navigation. |

Setting `enabled: false` disables fragment creation while keeping the tooltip overflow fix active.

## Example

Here is the source code for a comprehensive example: [example.qmd](example.qmd).

Output of `example.qmd`:

- [Reveal.js](https://m.canouil.dev/quarto-revealjs-codefrag/).
