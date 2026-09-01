# Infographic Types & Layout Blueprints

Pick the one type that matches the content's shape. Each blueprint is a starting
structure, not a cage — adapt spacing and section count to the material.

## Table of contents
1. Statistical / data-driven
2. Process / flow
3. Timeline / chronological
4. Comparison
5. Concept / explainer
6. Hierarchical
7. List / informational
8. Geographic / spatial

---

## 1. Statistical / data-driven

**Use when:** the message is carried by numbers — proportions, magnitudes,
growth, survey results.

**Blueprint:**
- Header band with title + context.
- **Hero stat**: the single headline figure, occupying ~25–35% of the canvas
  height, in the accent colour, with a one-line explanation.
- **Supporting stats grid**: 3–6 cards, each an icon + big number + short label.
- Optional **one chart** if a trend or ≥5 values matter (bar for category
  comparison, line/area for time series, donut for a single proportion).
- Footer: source + date.

**Watch for:** chart bars must be proportional to the quoted percentages; don't
pad the grid with weak stats to fill space.

---

## 2. Process / flow

**Use when:** the content is an ordered sequence — a how-to, a pipeline, a
workflow, a decision path, or a problem→solution ("bridge") / conversion
("funnel") narrative.

**Blueprint:**
- Title + one-line framing of what the process achieves.
- **Numbered step cards**, 3–7 of them, left→right (landscape) or top→bottom
  (portrait). Each card: number badge, step name, one sentence, small icon.
- **Connectors** — arrows or a running line — showing direction. Keep routing
  straight and non-crossing.
- Optional outcome/result box at the end, visually distinct.
- Footer.

**Variants:** *bridge* = problem block on the left, solution block on the right,
a span between them. *Funnel* = stacked bars narrowing downward with drop-off %.

---

## 3. Timeline / chronological

**Use when:** events unfold over time — company history, a product roadmap,
project milestones, an evolution.

**Blueprint:**
- Title + span ("2019 → 2025").
- **Vertical spine** down the centre (portrait) with entries alternating
  left/right, or a **horizontal axis** (landscape) with entries above/below.
- Each entry: date marker on the spine, a node dot, a card with headline +
  1–2 lines.
- Consistent visual rhythm; equal spacing unless time gaps are meaningful (then
  space proportionally and say so).
- Footer.

**Watch for:** more than ~7 entries gets cramped — group or select. Pick **one
date granularity and hold it for every entry** — all bare years (`2016`), or
all year-month (`2016.09`). Mixing `2010` with `2012.10` in the same timeline
reads as an oversight. If one entry genuinely needs a month, either give every
entry its month or move the month into that entry's body text.

**Japanese headings + alternating layout:** the alternating left/right spine
puts each card at ~45% width, which is tight for Japanese headline text. If
headings wrap to 3+ lines, switch to a single-side spine (all cards on the
right of a left-aligned rail) — it's calmer and gives the text room. The
`vertical-timeline.html` template's alternating layout is the starting point,
not a requirement.

---

## 4. Comparison

**Use when:** A vs B, before/after, pros/cons, or 2–3 plan tiers.

**Blueprint:**
- Title stating the comparison.
- **2 (or 3) columns**, each with its own header colour (one from primary, one
  from accent; keep the third neutral).
- Aligned rows of comparison criteria; use ✓ / ✕ or filled/empty marks, or a
  short value per cell.
- Optional verdict / recommendation strip at the bottom.
- Footer.

**Watch for:** columns must be visually equal weight — same width, same number
of rows. Don't stack the deck by giving one side more detail.

---

## 5. Concept / explainer

**Use when:** explaining how something works, what a thing is made of, or how
parts relate — no strong time or number axis.

**Blueprint options:**
- **Hub-and-spoke**: central concept in the middle, 3–6 related elements around
  it with connector lines and short labels.
- **Layered**: horizontal bands stacked to show levels of a system (e.g. a
  tech stack), each band labelled.
- **Annotated diagram**: a central simple illustration (inline SVG) with leader
  lines to callout labels.
- **Cycle**: 3–6 stages in a loop with curved arrows.

Always: title, the diagram as the dominant element, terse callouts, footer.

If the concept involves a **store, source, or input** that something acts on (a
knowledge base, a database, a user, an external feed), draw it as its own
labelled element with a connector into the flow — don't fold it into a caption.
Seeing *what* is being searched / read / fed in is often the point of the
diagram.

**Watch for:** leader lines that cross or branch ambiguously; a central visual
so detailed it competes with the labels.

---

## 6. Hierarchical

**Use when:** priority levels, a taxonomy, a pyramid of needs, an org structure.

**Blueprint:** stacked layers (widest at the base) or a branching tree. Each
level labelled, colour intensity increasing toward the apex. 3–5 levels.

---

## 7. List / informational

**Use when:** "N tips", a checklist, "things to know" — parallel items with no
order dependency.

**Blueprint:** a **bento grid** (2×3 or 3×3 unequal cells) or a numbered
vertical list. Each item: number/icon, heading, one line. Keep every cell the
same visual template.

---

## 8. Geographic / spatial

**Use when:** the data is meaningfully tied to places.

**Blueprint:** a simple map base (inline SVG — a plain region outline, not a
detailed cartographic map) with pinned callouts carrying the data. Keep the map
muted (neutral colour) so the callouts dominate.

**Watch for:** don't source a copyrighted map image; a schematic outline is
enough and stays on-brand.
