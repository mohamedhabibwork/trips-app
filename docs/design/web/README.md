# Web screen designs

Source artboards for the web app (`apps/web`), copied from the Trips Enjoy Design canvases on 2026-10-18.
Each `SCR-*.dc.html` is one screen at 1280×900 (desktop) or 390×844 (phone-width states), with the real copy and
inline styles. `canvas.json` in each folder lists the screen titles and their order. `tokens.json` is the design
system; the same values live in `packages/ui/src/styles/trips-enjoy.css`.

| Folder | Screens | Canvas |
| --- | --- | --- |
| `organization/` | SCR-ORG-01..42 | https://claude.ai/artifact/RvZimVxA3qwbkHQKVP89y6 |
| `admin/` | SCR-ADM-01..33 | https://claude.ai/artifact/MoVMM2jQvwYPsC1e8Z7iKU |
| `public-shared/` | SCR-PUB-01..19, SCR-SHR-01..16 | https://claude.ai/artifact/H2d4RUujYmLZrDuehMrrUb |

Mobile screens (traveler, parent, driver, moderator, photographer) are not here; they belong to the KMP apps.
The canvases are the source of truth: refresh these copies from them when a design changes.

Open a file in a browser to read it; the `support.js` script it names is the canvas runtime and is not needed to
see the markup.
