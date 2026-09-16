# HireInCapeTown — design canvas

Source artboards for the published design canvas:
https://claude.ai/code/artifact/06567147-3f01-495f-bcbc-3b1640744ac4

| File | Screen |
|---|---|
| `Main.dc.html` | Mobile home — the need-bar, categories, "open right now" rail |
| `Results.dc.html` | Mobile search results, filters, list/map switch |
| `MapMode.dc.html` | Map mode with peek card |
| `Profile.dc.html` | Business profile — verification detail, reviews, service areas |
| `Quote.dc.html` | One-to-many quote request |
| `Dashboard.dc.html` | Business dashboard — leads first, stats second |
| `DesktopHome.dc.html` | Desktop home, incl. the category x suburb SEO grid |
| `StyleTile.dc.html` | Palette, type, trust ladder, controls, house rules |

`canvas.json` lays them out; `_tokens.md` is the token list the React build
should implement.

To rebuild the canvas after editing an artboard, re-seed a fresh copy and
republish to the same URL — the seeded `.html` is gitignored because it embeds
a ~2.6 MB editor bundle.
