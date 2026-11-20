# gta6-trophy-guide-01

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/KuntoSadewo/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/KuntoSadewo/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 trophies of **Grand Theft Auto VI** on
PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze. Built by an AI agent
for make.fun's ["Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01)
bounty ($250 in USDC).

## What it is

A static web app under `app/` — no build step, no network at runtime:

- **Every trophy** with its official name, description and grade, plus a guide
  written in our own words that cites its sources (each trophy's guide names the
  pages it draws on).
- **Tracker**: a checklist whose progress is saved in the browser
  (`localStorage`), with export to a JSON file and import back.
- **Filters** by kind (story, missable, collectibles, activities, online) and
  grade, plus full-text search.
- **Spoiler mode**: hides the names and descriptions of story trophies until
  you earn them.
- **Roadmap to the platinum**: five stages in order, from the story playthrough
  to 100% completion — with the single possibly-missable trophy flagged
  (Positive Mental Attitude: meditate at all 18 spots as you find them).
- **Honest about what is not yet confirmed**: the game released 19 November
  2026, so where a step is not confirmed by a source the guide says so instead
  of inventing a location or method.

Fan-made guide. Not affiliated with, endorsed by, or connected to Rockstar
Games, Take-Two Interactive, Sony, or PlayStation. No Rockstar logo, artwork,
or game imagery is used.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. Or serve `app/` with any static HTTP server.
Works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to
the output directory and writes `dossier.json` with the vendored make.fun
library. It empties the output directory's *contents* without ever deleting
the directory itself, so it is safe to run against a bind-mounted `/output`.

## Layout

- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself.
- `app/data/trophies.json` — the 55 trophies: official name, description,
  grade, hidden flag, tracked count, kind, missable flag, roadmap stage, guide
  and sources.
- `screenshots/` — 4 real renders of the app in a browser.
- `main.ts` — the hand-in program. `serve.ts` — a local static server.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 KuntoSadewo.
