# Quality Checklist

Run this before showing the user. Anything that fails is fixed first, not
flagged as a "known issue". Ordered by how often it goes wrong and how badly it
reads.

## Accuracy (veto — never ship a fail)

- [ ] **Every number in the graphic matches the source verbatim.** No rounding,
      no re-derivation, no figure that isn't in the source material.
- [ ] **Every chart bar / slice is proportional to its value.** Spot-check 2–3:
      bar length ÷ axis == value ÷ max.
- [ ] Donut slices sum to 360°; percentage labels sum to ~100% (rounding noted).
- [ ] Bar/column charts start their axis at zero.
- [ ] **Source + date footer is present** and legible.
- [ ] No secrets, tokens, internal URLs, or personal data leaked from pasted
      source content.

## Message & structure

- [ ] The whole piece communicates **one** message — you can state it in a
      sentence.
- [ ] Each section conveys exactly one concept.
- [ ] 5–7 data points (≤10). Nothing padded in to fill space.
- [ ] There's a clear hero element that's genuinely dominant (3–5× body scale).
- [ ] Sections are in a sensible reading order (Z or F pattern); ordered
      content is numbered.

## Layout & balance

- [ ] Left/right and top/bottom carry roughly equal visual weight.
- [ ] ≥20px between elements, ≥40px between sections — and no large dead zones.
- [ ] Two-column comparisons: equal width, equal row count, equal detail.
- [ ] Timeline: one date granularity across all entries (all `YYYY`, or all
      `YYYY.MM`) — no mixing.
- [ ] Connectors/leader lines don't cross or branch ambiguously.
- [ ] Content fits the target aspect ratio without a scrollbar or clipping at
      the stated export size.

## Colour & type

- [ ] ≤3 colours (primary, accent, neutral). The accent appears only on
      emphasis, one element per section.
- [ ] ≤2 typefaces (+ optional mono for digits).
- [ ] Every text/background pair meets WCAG AA (4.5:1 body, 3:1 large text).
- [ ] No text smaller than 14px except the ~11px source line.
- [ ] Colour is never the *only* thing distinguishing two data series.

## Icons & detail

- [ ] One consistent icon style (all line or all filled).
- [ ] No icon reused for two different concepts.
- [ ] No decorative clutter: gratuitous shadows, gradients, borders, fake
      captions, watermarks.

## Japanese text

- [ ] `line-height` ≥1.7 on body text.
- [ ] No italic used for emphasis.
- [ ] Headings don't wrap awkwardly mid-word; manual breaks or `<wbr>` where
      needed.
- [ ] Bold weight actually renders bold (font ships the weight).

## File

- [ ] Self-contained: CSS inline, fonts from Google Fonts CDN, rasters as data
      URIs. Opens correctly from a double-click.
- [ ] `scripts/render.py` produces the PNG/PDF at the target dimensions without
      clipping.
