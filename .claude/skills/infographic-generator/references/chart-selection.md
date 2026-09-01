# Chart Selection

## First decision: chart, or just the number?

| Situation | Do this |
|---|---|
| 1–4 headline figures | **Big-number callouts.** Higher impact, zero rendering risk, no axis to misread. |
| A single proportion ("42% of X") | Big number + a small donut or a single progress bar for texture. |
| 5+ values in one category | **One chart.** |
| A trend over time | **One chart** (line/area). |
| A relationship between two variables | Scatter — but this is rare in an infographic; consider whether it belongs. |

An infographic carries **at most one chart**. If the content needs two, it's
two infographics or a dashboard.

## Chart type by data shape

| Data shape | Chart | Notes |
|---|---|---|
| Categories compared by magnitude | **Horizontal bar** | Sort by value unless the category order is meaningful (e.g. age bands). Label values at the bar end. |
| Parts of a whole, 2–5 parts | **Donut** | Label each slice with its %. More than 5 parts → grouped horizontal bar instead. |
| Value over time, continuous | **Line** (or **area** if the magnitude matters) | Few gridlines; label the endpoints and any called-out point. |
| Value over time, few discrete periods | **Column** | ≤ 8 columns. |
| Progress toward a target | **Single bar / gauge** | Show current and target explicitly. |
| Ranking / funnel stages | **Descending bars** with stage labels and drop-off %. |

Avoid in infographics: pie charts with >5 slices, dual-axis charts, radar
charts, 3-D anything, stacked bars with >3 segments.

## Rendering — inline SVG, computed from real numbers

Draw charts as inline SVG so values stay exact and the file stays
self-contained. The proportion rule: **a bar/slice for value _v_ out of axis
max _m_ occupies exactly _v/m_ of the axis length.** Compute it; don't
eyeball it.

```
barWidth = (value / axisMax) * chartWidth
donutSliceAngle = (value / total) * 360
```

Checklist for any chart you render:

- [ ] Every bar's length ÷ axis length == its value ÷ axis max (verify 2–3).
- [ ] Donut slice angles sum to 360°; labels sum to 100% (±1 for rounding, and
      note the rounding).
- [ ] Axis starts at zero for bar/column charts (a non-zero baseline
      exaggerates differences).
- [ ] Each series/category is distinguishable without colour (label directly).
- [ ] Axis lines and gridlines are neutral, low-opacity — they don't compete.
- [ ] Values or a clear scale are readable; no mystery magnitudes.
- [ ] The chart's takeaway matches the infographic's one message.

## Big-number callout pattern

```
[icon]  73%              ← accent colour, tabular figures, huge
        増加              ← label, 500 weight
        2023→2024, 国内EC市場   ← context, small, muted
```

Group 2–4 of these in a row or grid with equal spacing. This is usually the
right answer for a "statistical" infographic.
