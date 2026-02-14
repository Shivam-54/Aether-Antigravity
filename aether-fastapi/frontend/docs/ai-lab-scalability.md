# AI Lab — Tab Navigation Scalability Guide

> Reference doc for how to handle growing number of AI Lab features.

## Current State (Feb 2026)

- **Layout**: 4-column glass-card grid inside a glass container
- **Features**: Price Prediction, Risk Analysis, AI Insights, Sentiment (coming soon)
- **Files**: `dashboard.html` (HTML), `style.css` (CSS grid), `shares-ai.js` (tab switching + lazy loading)

---

## Scaling Strategy

### 4 Features (Current)
- `grid-template-columns: repeat(4, 1fr)` — perfect fit, one row

### 5–6 Features
- Switch to **3-column grid** → clean 2×3 layout
- Change CSS: `grid-template-columns: repeat(3, 1fr)`
- Cards stay the same size, just wrap to a second row

### 7–8+ Features
Grid gets too tall — switch to one of these patterns:

#### Option A: Horizontal Scroll Row
- Compact cards into narrower pills (icon + title only, no description)
- `display: flex; overflow-x: auto; gap: 10px;`
- Add subtle left/right arrow buttons for discoverability
- Feels like a Netflix category row

#### Option B: Compact Chip Style
- Shrink to icon + title only (drop the description line)
- Use `flex-wrap: wrap` so chips flow into multiple rows
- Keeps everything visible without scrolling

#### Option C: Grouped Categories
- Split features into logical groups:
  - **Analysis**: Price Prediction, Risk Analysis, Sentiment
  - **Intelligence**: AI Insights, Portfolio Advisor, Anomaly Detection
- Small category label above each group
- Each group uses a horizontal row of compact cards

### Recommendation
| Count | Best Approach |
|-------|--------------|
| 4     | 4-col grid (current) |
| 5–6   | 3-col grid |
| 7–8   | Horizontal scroll row |
| 9+    | Grouped categories |

---

## Implementation Notes

- **Lazy loading**: Each new tab should follow the existing pattern — only fetch data when the tab is first clicked (see `riskLoaded` / `insightsLoaded` flags in `shares-ai.js`)
- **Tab switching**: Add new cases to `switchAILabTab()` for any new tab name
- **CSS cache**: Always bump `style.css?v=XX` version in `dashboard.html` when updating styles
- **Mobile**: The `@media (max-width: 768px)` rule already drops to 2 columns — update if switching layouts
