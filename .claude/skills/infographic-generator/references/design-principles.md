# Design Principles

The rules an infographic lives or dies by. Internalize the reasoning, not just
the numbers.

## One message

An infographic answers one question. Before laying anything out, write the
single sentence the viewer should walk away with. Every section either supports
that sentence or gets cut. Two messages = two infographics.

## Curation over completeness

5–7 data points, 10 maximum. The value of an infographic is the *editing* — you
did the work of deciding what matters so the viewer doesn't have to. A dense
dump of every statistic is a table, and tables don't get shared.

## Visual hierarchy

The viewer's eye should land in a deliberate order: **title → hero stat →
section headings → body → source**. Enforce it with three levers, consistently:

- **Size** — the hero number is genuinely large (3–5× body size), not just a bit
  bigger.
- **Weight & colour** — the accent colour appears on the *one* thing per section
  that matters most, nowhere else.
- **Position** — important things sit higher and further left (for LTR reading).

Design top-down, large-to-small. Place the hero element first, then arrange
supporting content around it.

## Focal point per section

Each section conveys exactly one concept and has one dominant element (a number,
an icon, a mini-chart). If a section has two numbers competing for attention,
split it or demote one.

## Whitespace is structure

Whitespace is not leftover space — it groups related items, separates unrelated
ones, and gives the eye somewhere to rest. Concrete rhythm:

- ≥ 20px between elements within a section
- ≥ 40px between sections
- Balanced outer margins (don't let content drift to one edge)

Both failure directions are real: cramped content with no gaps, *and* a few
elements stranded in a sea of empty canvas. Aim for even visual density.

## Balance

Left and right halves (and top/bottom) should carry roughly equal visual
weight. A layout that's heavy on one side reads as unfinished. For alternating
timelines and two-column comparisons this is automatic; for freeform concept
layouts, check it explicitly.

## Reading flow

Lay sections along the path the eye naturally takes:

- **Z-pattern** for sparse layouts — top-left → top-right → diagonal →
  bottom-left → bottom-right.
- **F-pattern** for text-denser layouts — the eye scans top line, drops, scans a
  shorter line, then down the left edge.

Number your steps and sections when order matters; don't rely on position alone.

## Data-ink ratio

Every pixel should carry information. Strip: drop shadows that don't separate
layers, gradients that don't encode data, decorative borders, redundant chart
titles, watermarks, faux captions. Labels are short and direct — "売上 42%"
not "2024年度の売上高構成比は42%となっています".

## Colour discipline

One primary, one accent, one neutral. Three colours total. The accent is
reserved for emphasis — the moment it's used decoratively, it stops signalling
importance. Match the palette to the audience (see `color-palettes.md`) and
verify every text/background pair meets WCAG AA (4.5:1 for body, 3:1 for large
text).

## Typography

Two typefaces maximum — heading and body. Size, not font-switching, creates
hierarchy. Minimum sizes: ~14px on-screen body, ~11px for the source line, and
large enough that the hero number is readable across a meeting room if the piece
is for slides.

## Japanese-text specifics

- Use a generous `line-height` (1.7–1.9) — Japanese glyphs are dense.
- Don't rely on *italic* for emphasis (fake-slanted kana look broken); use
  weight, colour, or size.
- Control line breaks in headings with `<wbr>` or manual breaks —
  auto-wrapping mid-word (文節) looks careless. Consider
  `word-break: keep-all` / `line-break: strict` and `overflow-wrap: anywhere`
  tuned per element.
- Prefer a font with a real bold weight (many free JP webfonts ship only one
  weight — see `typography.md`).
- Number-heavy content: keep digits in a Latin font (tabular figures) even when
  surrounding text is Japanese, for cleaner alignment.

## Icons

One consistent set, one visual style (all line, or all filled — not mixed).
Never use the same icon for two different concepts; if you're short an icon,
use a labelled dot rather than an approximate reuse. Inline SVG keeps the file
self-contained; Font Awesome free via CDN is acceptable and commercially safe.

## Attribution

Every infographic ends with a source + date line. Numbers without a visible
source read as invented, no matter how careful you were.
