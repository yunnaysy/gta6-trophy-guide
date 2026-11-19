# Leonida Ledger — GTA 6 Trophy Guide & Platinum Roadmap

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/yunnaysy/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/yunnaysy/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

**Leonida Ledger** is an offline, original-design companion for the Grand Theft Auto VI PlayStation 5 trophy list. It tracks all 55 official trophies, lays out a platinum roadmap, and flags every missable trophy — with no Rockstar logos, official artwork, box art, or in-game screenshots.

## Features

- Instant search across official names, descriptions, and walkthroughs
- Filters for grade (Platinum, Gold, Silver, Bronze), category, missable trophies, spoiler-safe blur, and earned or remaining status
- Interactive progress dashboard with completion percent and grade counts
- Click-to-check tracking persisted in `localStorage`
- Expandable step-by-step unlock strategies, missable warnings, source citations, and a phased platinum roadmap
- JSON and Markdown backup export and import
- Designed to stay fully usable at a 1280×720 desktop viewport with no clipped controls or typography

## Run locally

Requires Node.js 22 or later. From the repository root:

```bash
node serve.ts
```

Then open http://localhost:8080

## Trophy data and sources

Official trophy names, descriptions, and grades are shown as PlayStation publishes them. Walkthroughs are original to this entry and cite the official PlayStation 5 list (Exophase / PSNProfiles, 18 November 2026).

## Design and fonts

The Vice City / Leonida sunset look is original. Display type is Bebas Neue (SIL Open Font License), vendored under `app/fonts/` with `app/fonts/OFL.txt`.

## License

MIT. See [LICENSE](LICENSE). SPDX-License-Identifier: MIT
