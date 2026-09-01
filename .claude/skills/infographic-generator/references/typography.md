# Typography

Two typefaces: one for headings, one for body. All available on Google Fonts
with Japanese coverage and multiple weights, and all free for commercial use.

## Japanese-capable pairings

| # | Heading | Body | Character |
|---|---|---|---|
| 1 | **Zen Kaku Gothic New** (700) | **Noto Sans JP** (400/500) | Clean, neutral, safe for business |
| 2 | **BIZ UDPGothic** (700) | **BIZ UDPGothic** (400) | UD / accessibility-first, one family |
| 3 | **Shippori Mincho** (600/700) | **Noto Sans JP** (400) | Editorial: serif head, sans body |
| 4 | **Zen Maru Gothic** (700) | **Noto Sans JP** (400) | Rounded, friendly — education/consumer |
| 5 | **M PLUS 1p** (800) | **M PLUS 1p** (400) | Modern tech, geometric, one family |
| 6 | **Noto Serif JP** (700) | **Noto Serif JP** (400) | Traditional, authoritative, print |

For **numbers and Latin**, pair with a tabular-figure Latin font so digits
align in columns:

- **Roboto Mono** or **IBM Plex Mono** — for stat cards and chart labels.
- **Inter** (with `font-feature-settings: "tnum"`) — for inline figures in
  running text.

Set digits explicitly, e.g.:

```css
.stat-number { font-family: "Inter", "Noto Sans JP", sans-serif;
               font-feature-settings: "tnum"; }
```

## Type scale (16:9 / 1600×900 canvas)

Scale down ~15% for square, up ~10% for A4 print. These are starting values.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Infographic title | 48–60px | 700 | One line if possible |
| Context / dek | 20–24px | 400 | Muted colour |
| Hero number | 110–160px | 700 | The largest thing on the canvas |
| Hero label | 22–26px | 500 | |
| Section heading | 26–32px | 700 | |
| Body / card text | 16–19px | 400 | line-height 1.7–1.9 |
| Stat card number | 44–60px | 700 | tabular figures |
| Caption / small label | 13–15px | 500 | |
| Source line | 11–13px | 400 | ~55% opacity |

Minimums: never below 14px for anything the viewer needs to read, 11px for the
source line. If the piece is for on-screen slides, bump body to ≥18px.

## Rules

- **Weight for emphasis, not italic** — slanted kana render poorly.
- **Two weights per family is enough** — regular + bold. A third (medium/500) is
  fine for labels; more than that muddies the hierarchy.
- **Headings:** `line-height` 1.3–1.4, control breaks manually or with `<wbr>`,
  consider `line-break: strict`.
- **Body:** `line-height` 1.7–1.9, `letter-spacing` 0.02–0.04em reads well for
  Japanese at small sizes.
- **Loading:** one `<link>` to Google Fonts with only the weights you use, e.g.
  `family=Noto+Sans+JP:wght@400;700&family=Zen+Kaku+Gothic+New:wght@700`.
  Add a real fallback stack: `"Noto Sans JP", "Hiragino Sans", "Yu Gothic",
  sans-serif`.
