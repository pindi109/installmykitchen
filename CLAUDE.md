# InstallMyKitchen.co.uk — Project State

**Do not treat this as a greenfield project. The site is built, deployed, and live.**

## Quick context

- **Repo:** `/home/pindi/installmykitchen/` (Astro 4, Node 22)
- **Live site:** https://installmykitchen.co.uk
- **Hosting:** Netlify (account: bsahota@me.com)
- **Node version:** Always run `export PATH="/home/pindi/.nvm/versions/node/v22.23.0/bin:$PATH"` before any npm command
- **Build command:** `npm run build` → `dist/` (takes ~35s)
- **Last build:** 2026-06-29 — **1,826 pages, zero errors**

## What is this site?

Independent kitchen installation service for Pindi Sahota. Covers Coventry/Warwickshire and Berkshire. The site is programmatic SEO — most pages are generated from templates × location/brand data. Pindi is NOT affiliated with any kitchen retailer; we install kitchens bought from any retailer.

## Build state as of 2026-06-29

### Page count breakdown (all intentional, no accidental route explosion)

| Route family | Pages | Template |
|---|---|---|
| `repairs/` | 556 | `[job]-[location].astro` + `[brand]-[job]-[location].astro` + hub |
| `installer/` | 429 | `[brand]-[location].astro` — 13 brands × 33 locations |
| `styles/` | 341 | `[style]-[location].astro` + style hubs |
| `appliances/` | 76 | `[appliance]-[location].astro` + hub |
| `areas/` | 34 | `[area].astro` — 33 locations + hub |
| `areas-retailers/` | 34 | `[area].astro` — 33 locations + hub |
| `fitter/` | 33 | `[location].astro` — 33 locations |
| `kitchen-cost/` | 33 | `[location].astro` — 33 locations |
| `survey/` | 34 | `[location].astro` — 33 locations + hub |
| `retailers/` | 14 | `[retailer].astro` — 13 brands + hub |
| Top-level / misc | 168 | Static pages — questions/, answers/, guides/, llm/, comparisons/, cost/, kitchen-fitter-*, etc. |

**Sitemap:** 1,807 entries (18 utility/legal pages intentionally excluded: privacy, terms, thank-you, html-sitemap, gallery, etc.)

### Locations (33 total)

**Coventry/Warwickshire (25):** coventry, rugby, nuneaton, bedworth, leamington-spa, kenilworth, warwick, solihull, stratford-upon-avon, southam, atherstone, hinckley, balsall-common, meriden, earlsdon, canley, tile-hill, allesley, finham, stivichall, coundon, radford, binley, wyken, walsgrave

**Berkshire (8, added Wave 1):** reading, bracknell, slough, maidenhead, windsor, wokingham, newbury, ascot

### Brands / retailers (13)

benchmarx, bq, diy-kitchens, howdens, ikea, kutchenhaus, magnet, magnet-trade, masterclass, nolte, symphony, wickes, wren

### Repair job types (17, in `src/data/remedial.json`)

Hinge replacement, door replacement, drawer repair, unit adjustment, worktop replacement, plinth replacement, end panel replacement, kitchen removal, soft-close upgrade, kitchen refit, handle replacement, fridge-freezer door fitting, fridge door fitting, dishwasher door fitting, oven door fitting, kitchen survey, kitchen survey follow-up

## Key data files

| File | Purpose |
|---|---|
| `src/data/locations.json` | All 33 locations with name, slug, county, description, nearby[] |
| `src/data/retailers.json` | All 13 retailers with slug, displayName, color, installNote |
| `src/data/remedial.json` | 17 repair job types with CW/Berkshire prices |
| `src/data/styles.json` | Kitchen styles (shaker, handleless, german, in-frame, etc.) |
| `src/data/faqs.json` | FAQ pools used by template pages |

## What was done in Wave 1 (2026-06-27)

- Added 8 Berkshire locations to `locations.json` (`isBerkshire: true` flag)
- Created `src/data/remedial.json` (17 repair types with prices)
- Built `src/pages/repairs/index.astro` — hub page
- Built `src/pages/repairs/[job]-[location].astro` — 255 pages (17 × 15 CW locations)
- Built `src/pages/repairs/[brand]-[job]-[location].astro` — 300 pages (5 brands × 4 jobs × 15 locations)
- Built `src/pages/appliances/[appliance]-[location].astro` — 75 pages (5 × 15)
- Added Berkshire 8 to `PRIORITY_LOCATION_SLUGS` in installer template
- Updated `sitemap.xml.ts` with all new routes

## Facebook

Added 2026-06-29: **https://facebook.com/installmykitchenuk** (no www — consistent with project non-www convention)

- Footer link: `src/components/Footer.astro` — live on every page
- Schema `sameAs`: added to all 14 files that have a top-level `LocalBusiness` JSON-LD object

## What's still pending (as of 2026-06-29)

- **Hero images** for new pages — currently using `/assets/hero-placeholder.svg`. Need fal.ai key to generate. Once done: update `hero-manifest.json` and `alt-tags-remedial.json`.
- **llms.txt** — update to mention Berkshire locations and remedial/repair services
- **Deploy to Netlify** — not yet deployed since Wave 1. Use `netlify deploy --prod` (bsahota@me.com account)
- **GSC sitemap resubmission** — after deploy, resubmit `https://installmykitchen.co.uk/sitemap.xml`
- **Cookie consent + GA Consent Mode v2** — compliance gap, not yet built
- **Wave 2** — more brand × repair combinations, more Berkshire locations (sandhurst, thatcham, fleet, camberley, etc.)
- **Instagram link** in footer — currently `href="#"` placeholder until account exists

## SEO keyword detection (PageRank SEO tool)

A separate keyword detection run was completed 2026-06-29 using the tool at `/home/pindi/pagerank-seo/`.

- CSV at `/home/pindi/pagerank-seo/output/keywords.csv` — 1,818 content pages with primary keywords
- 96% high confidence, 3% low (mainly `areas/` hub pages needing Serper validation)
- 0 single-word primaries after fixes, 20 duplicate groups for manual review

## Architecture notes

- No shared LocalBusiness schema component — each page template defines its own JSON-LD in frontmatter
- Footer and Header are shared components (`src/components/`)
- Base layout at `src/layouts/Base.astro` — has a `<slot name="schema" />` that pages use to inject JSON-LD
- All URLs are non-www, trailing slash everywhere
- Tailwind via CDN (not bundled) — class names are not purged
- No custom JavaScript beyond what Astro inlines

## Do not do

- Do not run `npm install` without checking Node version first
- Do not add new route families without updating `sitemap.xml.ts`
- Do not use `www.` in any URLs — project convention is apex domain throughout
- Do not touch `dist/` directly — always rebuild from source
