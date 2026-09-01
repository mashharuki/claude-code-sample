# Colour Palettes

Ready 3-colour sets: **primary** (structure, headings), **accent** (the one
emphasis colour), **neutral** (backgrounds, body text, lines). Each is paired
with an off-white page background and a near-black text colour unless noted.

Contrast ratios are against the page background `#FCFCFA` (or the noted bg).
All body-text pairs listed meet WCAG AA (≥4.5:1).

Pick by audience. Don't blend two palettes.

| # | Audience / mood | Primary | Accent | Neutral | Page bg | Text |
|---|---|---|---|---|---|---|
| 1 | Business / corporate, trust | `#1B3A5C` (navy) | `#E8703A` (burnt orange) | `#8CA0B3` | `#FCFCFA` | `#16202B` |
| 2 | Tech / SaaS, modern | `#2A2D7C` (indigo) | `#12B8A6` (teal) | `#9AA0B4` | `#FBFBFD` | `#1A1B2E` |
| 3 | Finance / data, sober | `#12403A` (deep green) | `#C9A227` (gold) | `#7D9490` | `#FBFAF6` | `#12201D` |
| 4 | Healthcare / calm | `#1E6E7A` (teal-blue) | `#E4655E` (coral) | `#8FB0B4` | `#FBFDFD` | `#14343A` |
| 5 | Education / friendly | `#33488F` (blue) | `#F2A93B` (amber) | `#93A0BE` | `#FDFCF8` | `#1D2444` |
| 6 | Consumer / energetic | `#B5273F` (crimson) | `#F4C542` (yellow) | `#C79aa0` | `#FFFDF7` | `#2A1216` |
| 7 | Sustainability / nature | `#3A6B35` (leaf) | `#D97D2E` (clay) | `#9BB08C` | `#FBFCF7` | `#1E2E1B` |
| 8 | Editorial / neutral, print | `#2B2B2B` (ink) | `#B4472E` (rust) | `#A5A097` | `#F7F4EC` | `#1E1E1E` |
| 9 | Government / public sector | `#274060` (slate blue) | `#8C6A3F` (bronze) | `#8A97A6` | `#FBFBFB` | `#1A2634` |
| 10 | Dark mode / dashboard | `#4FA3E3` (sky) | `#F2724B` (orange) | `#5A6675` | `#161A20` | `#E8ECF1` |

## Usage guidance

- **Backgrounds:** page bg for the canvas, `white` (or a 2–4% tint of primary)
  for cards, a light neutral for section dividers. Never a full-saturation
  colour fill behind body text.
- **Accent budget:** one element per section. The hero number, an active step,
  the recommended column — pick one.
- **Charts:** primary for the main series, neutral for secondary/context bars,
  accent only to spotlight one bar. For a sequential scale, tint the primary
  from ~15% to 100%.
- **Lines / connectors / axes:** neutral at 40–60% opacity. They orient, they
  don't compete.

## Colour-blindness

Palettes 1–5 and 8–9 keep primary and accent distinguishable under
protanopia/deuteranopia (they differ in lightness, not just hue). For 6 and 7,
also encode category by label or icon, not colour alone. Never rely on
red/green as the only difference between two data series.

## Building a custom palette

If the user has brand colours: take their main brand colour as primary, choose
an accent that is (a) roughly complementary and (b) clearly different in
lightness, and use a desaturated grey-tint of the primary as neutral. Verify
every text pair at webaim.org/resources/contrastchecker logic (4.5:1 body,
3:1 large). Keep it to three.
