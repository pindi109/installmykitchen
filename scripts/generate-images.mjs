/**
 * IMK Image Generation — Install My Kitchen
 * Usage: node scripts/generate-images.mjs [--test]
 *
 * Requires FAL_KEY env var. Never prints, logs, or writes the key.
 *
 * Strategy: 3 API calls total (one per ratio), each requesting 15 images.
 * 15 grids × 3 ratios = 45 grids → assign one grid per theme (12 themes), spares discarded.
 * Each grid is a 2×2 at true 4K. Crop tile 0 (top-left, installer), resize → WebP q82.
 *
 * Grid dimensions (spec §5.2):
 *   16:9  ~4096×2304  quadrant 2048×1152  hero  1834×1024  quadrant short-side floor ≥1024px
 *   4:3   ~4096×3072  quadrant 2048×1536  mid    800×600   quadrant short-side floor  ≥600px
 *   9:16  ~2304×4096  quadrant 1152×2048  side   540×960   quadrant short-side floor  ≥960px
 *
 * Hard-fail: any grid's shortest side < 3500px
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Security gate ─────────────────────────────────────────────────────────────
const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("[FATAL] FAL_KEY environment variable is not set. Exiting.");
  process.exit(1);
}

// ── Config ────────────────────────────────────────────────────────────────────
const FAL_MODEL      = "fal-ai/nano-banana-pro";
const FAL_URL        = `https://fal.run/${FAL_MODEL}`;
const BATCH_SIZE     = 4;   // fal-ai/nano-banana-pro max per call
// Model may return larger-than-nominal grids (e.g. 5504×3072 for 16:9).
// Per-slot quadrant floor check is the authoritative gate; grid-level floor
// only catches truly low-res returns (~1024px = wrong resolution param).
const GRID_MIN_SHORT = 1800;

const SLOTS = {
  hero: { ratio: "16:9", w: 1834, h: 1024, quadrantFloor: 1024 },
  mid:  { ratio: "4:3",  w: 800,  h: 600,  quadrantFloor: 600  },
  side: { ratio: "9:16", w: 540,  h: 960,  quadrantFloor: 960  },
};

// ── Prompts (verbatim from spec §5) ──────────────────────────────────────────
const PROMPTS = {
  "16:9": `A 2x2 grid of four distinct photorealistic landscape images in 16:9, evenly divided into four equal quadrants, no borders, no gaps, no text between cells.
TOP-LEFT: a professional kitchen installer in a plain dark polo with absolutely no text, no logo and no branding on the clothing, mid-task fitting a modern British kitchen — hands on a cabinet door or worktop, focused, natural daylight from a window, wide landscape framing.
TOP-RIGHT: a finished sage green shaker kitchen, premium matte cabinetry, quartz worktop, brushed brass handles, real British home, natural light, wide landscape framing, no people.
BOTTOM-LEFT: a handleless matte charcoal kitchen with integrated appliances, clean lines, real British home, natural light, wide landscape framing, no people.
BOTTOM-RIGHT: a wide view of a freshly fitted kitchen run — base and wall units with cornice and pelmet detail, quartz worktop, real British home, natural light, no people.
STYLE: real British homes, natural daylight, premium cabinetry, editorial home-improvement photography, full-frame 35mm wide look, sharp focus, ultra-detailed, crisp, high resolution. Not stock-photo cheesy, not obviously AI. No text, no logos, no watermarks. People ONLY in top-left.`,

  "4:3": `A 2x2 grid of four distinct photorealistic images in 4:3, evenly divided into four equal quadrants, no borders, no gaps, no text between cells.
TOP-LEFT: a close working shot of an installer's hands fitting a cabinet hinge or aligning a drawer front, clean dark workwear with no text or logo, natural light, shallow depth of field.
TOP-RIGHT: a detail of a quartz worktop join or a fitted undermount sink with brushed brass tap, real British kitchen, natural light, no people.
BOTTOM-LEFT: an integrated dishwasher or washing machine with the decor door fitted flush, cabinetry around it, real British kitchen, natural light, no people.
BOTTOM-RIGHT: a finished kitchen corner showing end panels, plinth and soft-close drawers, premium cabinetry, real British home, natural light, no people.
STYLE: real British homes, natural daylight, premium cabinetry, editorial home-improvement photography, full-frame 50mm look, sharp focus, ultra-detailed, crisp, high resolution. Not stock-photo cheesy, not obviously AI. No text, no logos, no watermarks. People ONLY in top-left.`,

  "9:16": `A 2x2 grid of four distinct photorealistic vertical portrait images in 9:16, evenly divided into four equal quadrants, no borders, no gaps, no text between cells.
TOP-LEFT: a tall vertical shot of an installer standing and fitting a wall cabinet or tall larder unit, plain dark workwear with no text or logo, focused, natural daylight, full-height framing.
TOP-RIGHT: a vertical view of a tall larder or pantry unit with doors fitted, premium cabinetry, real British kitchen, natural light, no people.
BOTTOM-LEFT: a vertical run of full-height kitchen units in sage green shaker style, brushed brass handles, real British home, natural light, no people.
BOTTOM-RIGHT: a vertical detail of a tall handleless charcoal unit beside an integrated fridge freezer with decor door, real British kitchen, natural light, no people.
STYLE: real British homes, natural daylight, premium cabinetry, editorial home-improvement photography, full-frame 50mm look, vertical composition, sharp focus, ultra-detailed, crisp, high resolution. Not stock-photo cheesy, not obviously AI. No text, no logos, no watermarks. People ONLY in top-left.`,
};

// ── Themes (12 total — must be ≤ BATCH_SIZE) ─────────────────────────────────
const THEMES = [
  { id: "door-replacement",       dir: "repairs/door-replacement",
    repairSlugs: ["kitchen-door-replacement","kitchen-cupboard-door-replacement"] },
  { id: "appliance-door",         dir: "repairs/appliance-door",
    repairSlugs: ["integrated-appliance-door-fitting","washing-machine-door-fitting",
                  "dishwasher-door-fitting","fridge-freezer-door-fitting"] },
  { id: "hinge-upgrade",          dir: "repairs/hinge-upgrade",
    repairSlugs: ["kitchen-hinge-replacement","soft-close-hinge-upgrade"] },
  { id: "drawer-repair",          dir: "repairs/drawer-repair",
    repairSlugs: ["kitchen-drawer-repair"] },
  { id: "plinth-pelmet",          dir: "repairs/plinth-pelmet",
    repairSlugs: ["kitchen-plinth-replacement","cornice-and-pelmet-fitting"] },
  { id: "end-panel",              dir: "repairs/end-panel",
    repairSlugs: ["kitchen-end-panel-replacement"] },
  { id: "worktop-work",           dir: "repairs/worktop-work",
    repairSlugs: ["kitchen-worktop-alteration","kitchen-worktop-joint-repair"] },
  { id: "adjustment-snag",        dir: "repairs/adjustment-snag",
    repairSlugs: ["kitchen-unit-adjustment","kitchen-snagging",
                  "kitchen-finishing-after-diy-install"] },
  { id: "dishwasher-install",     dir: "appliances/dishwasher",
    applianceSlugs: ["integrated-dishwasher-installation"] },
  { id: "fridge-install",         dir: "appliances/fridge",
    applianceSlugs: ["integrated-fridge-installation","integrated-fridge-freezer-installation"] },
  { id: "washing-machine-install", dir: "appliances/washing-machine",
    applianceSlugs: ["washing-machine-installation"] },
  { id: "oven-install",           dir: "appliances/oven",
    applianceSlugs: ["integrated-oven-installation"] },
];


const REMEDIAL_LOCATIONS = [
  "coventry","solihull","leamington-spa","warwick","kenilworth",
  "nuneaton","rugby","reading","bracknell","slough",
  "maidenhead","windsor","wokingham","newbury","ascot",
];
const REPAIR_BRANDS    = ["wren","howdens","magnet","ikea","wickes"];
const BRAND_REPAIR_JOBS = [
  "kitchen-door-replacement","kitchen-hinge-replacement",
  "kitchen-unit-adjustment","kitchen-plinth-replacement",
];

// ── fal.ai batch call ─────────────────────────────────────────────────────────
async function callFalBatch(ratio, count) {
  const payload = {
    prompt:        PROMPTS[ratio],
    aspect_ratio:  ratio,
    resolution:    "4K",
    num_images:    count,
    output_format: "png",
  };

  console.log(`\n[fal] POST ${FAL_URL}`);
  console.log(`[fal] aspect_ratio=${ratio} resolution=4K num_images=${count}`);
  console.log(`[fal] prompt: ${payload.prompt.slice(0, 100).replace(/\n/g," ")}…`);

  const res = await fetch(FAL_URL, {
    method: "POST",
    headers: { "Authorization": `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`fal.ai ${res.status}: ${txt}`);
  }

  const data = await res.json();
  const images = data?.images;
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error(`fal.ai: no images in response: ${JSON.stringify(data).slice(0,300)}`);
  }

  console.log(`[fal] received ${images.length} image URLs`);

  // Download all in parallel
  const buffers = await Promise.all(images.map(async (img, i) => {
    const dlRes = await fetch(img.url);
    if (!dlRes.ok) throw new Error(`Download[${i}] failed: ${dlRes.status}`);
    const ab  = await dlRes.arrayBuffer();
    const buf = Buffer.from(ab);
    const meta = await sharp(buf).metadata();
    const shortSide = Math.min(meta.width, meta.height);
    console.log(`  grid[${i}] ${meta.width}×${meta.height}px  short=${shortSide}px`);
    if (shortSide < GRID_MIN_SHORT) {
      throw new Error(
        `[HARD FAIL] grid[${i}] short side ${shortSide}px < ${GRID_MIN_SHORT}px. ` +
        `Check resolution param — wrong key silently returns ~1024px.`
      );
    }
    return { buf, width: meta.width, height: meta.height };
  }));

  return buffers;
}

// ── Crop tile 0 (top-left, installer) ────────────────────────────────────────
async function cropTile0(buf, gridW, gridH, slotCfg) {
  const qW = Math.floor(gridW / 2);
  const qH = Math.floor(gridH / 2);
  const qShort = Math.min(qW, qH);
  if (qShort < slotCfg.quadrantFloor) {
    throw new Error(
      `[HARD FAIL] quadrant short side ${qShort}px < slot floor ${slotCfg.quadrantFloor}px (${slotCfg.ratio})`
    );
  }
  return sharp(buf).extract({ left: 0, top: 0, width: qW, height: qH }).toBuffer();
}

// ── Save WebP ─────────────────────────────────────────────────────────────────
async function saveWebP(quadBuf, w, h, outPath) {
  mkdirSync(outPath.split("/").slice(0,-1).join("/"), { recursive: true });
  await sharp(quadBuf).resize(w, h, { fit:"cover", position:"centre" }).webp({ quality:82 }).toFile(outPath);
  console.log(`  → saved ${outPath} (${w}×${h})`);
}

// ── Manifest / alt-tags ───────────────────────────────────────────────────────
const manifestPath  = join(ROOT, "public/hero-manifest.json");
const altTagsPath   = join(ROOT, "src/data/alt-tags-remedial.json");
const manifest      = JSON.parse(readFileSync(manifestPath, "utf8"));
const altTags       = existsSync(altTagsPath) ? JSON.parse(readFileSync(altTagsPath, "utf8")) : {};
const manifestBefore = Object.keys(manifest).length;

function addManifestEntries(theme, heroPubPath) {
  if (theme.repairSlugs) {
    for (const jobSlug of theme.repairSlugs) {
      for (const loc of REMEDIAL_LOCATIONS) {
        const k = `repairs/${jobSlug}-${loc}`;
        manifest[k] = heroPubPath;
        altTags[k]  = "Professional kitchen installer carrying out kitchen repairs";
      }
      if (BRAND_REPAIR_JOBS.includes(jobSlug)) {
        for (const brand of REPAIR_BRANDS) {
          for (const loc of REMEDIAL_LOCATIONS) {
            const k = `repairs/${brand}-${jobSlug}-${loc}`;
            manifest[k] = heroPubPath;
            altTags[k]  = "Professional kitchen installer carrying out kitchen repairs";
          }
        }
      }
    }
  }
  if (theme.applianceSlugs) {
    for (const appSlug of theme.applianceSlugs) {
      for (const loc of REMEDIAL_LOCATIONS) {
        const k = `appliances/${appSlug}-${loc}`;
        manifest[k] = heroPubPath;
        altTags[k]  = "Professional kitchen installer fitting an integrated appliance";
      }
    }
  }
  // repairs hub
  if (theme.id === "door-replacement" && !manifest["repairs"]) {
    manifest["repairs"] = heroPubPath;
  }
}

function persist() {
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  writeFileSync(altTagsPath,  JSON.stringify(altTags,  null, 2) + "\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const testMode = args.includes("--test");
const count    = testMode ? 1 : BATCH_SIZE;

console.log("═══════════════════════════════════════════════");
console.log(" IMK Image Generation — Install My Kitchen");
console.log(`  Model:   ${FAL_MODEL}`);
console.log(`  Themes:  ${THEMES.length}`);
console.log(`  Batch:   ${count} images per ratio call`);
console.log(`  Mode:    ${testMode ? "TEST (1 image per call, first theme only)" : "FULL"}`);
console.log("═══════════════════════════════════════════════\n");

let ok = 0, fail = 0;

for (const ratio of ["16:9", "4:3", "9:16"]) {
  const slot = ratio === "16:9" ? "hero" : ratio === "4:3" ? "mid" : "side";
  const slotCfg = SLOTS[slot];

  const themesToProcess = testMode ? THEMES.slice(0, 1) : THEMES;

  // Split into chunks of BATCH_SIZE
  for (let chunkStart = 0; chunkStart < themesToProcess.length; chunkStart += BATCH_SIZE) {
    const chunk = themesToProcess.slice(chunkStart, chunkStart + BATCH_SIZE);

    // Skip chunk if all themes in it already have this slot
    const allExist = chunk.every(theme =>
      existsSync(join(ROOT, `public/assets/heroes/${theme.dir}/${slot}.webp`))
    );
    if (allExist) {
      for (const theme of chunk) {
        const pubPath = `/assets/heroes/${theme.dir}/${slot}.webp`;
        if (slot === "hero") addManifestEntries(theme, pubPath);
        ok++;
        console.log(`  [skip] ${theme.id}/${slot} already exists`);
      }
      continue;
    }

    let grids;
    try {
      grids = await callFalBatch(ratio, chunk.length);
    } catch (err) {
      console.error(`[ERROR] Batch ${ratio} chunk ${chunkStart}: ${err.message}`);
      fail += chunk.length;
      continue;
    }

    for (let i = 0; i < chunk.length; i++) {
      const theme   = chunk[i];
      const grid    = grids[i];
      if (!grid) { console.warn(`  [warn] No grid[${i}] for theme ${theme.id} — skipping`); continue; }

      const outFile = join(ROOT, `public/assets/heroes/${theme.dir}/${slot}.webp`);
      const pubPath = `/assets/heroes/${theme.dir}/${slot}.webp`;

      if (existsSync(outFile)) {
        console.log(`  [skip] ${theme.id}/${slot} already exists`);
        if (slot === "hero") addManifestEntries(theme, pubPath);
        ok++;
        continue;
      }

      try {
        const quad = await cropTile0(grid.buf, grid.width, grid.height, slotCfg);
        await saveWebP(quad, slotCfg.w, slotCfg.h, outFile);
        if (slot === "hero") addManifestEntries(theme, pubPath);
        persist();
        ok++;
      } catch (err) {
        console.error(`  [ERROR] ${theme.id}/${slot}: ${err.message}`);
        fail++;
      }
    }
  }
}

persist();

console.log("\n═══════════════════════════════════════════════");
console.log(` Done: ${ok} ok, ${fail} failed`);
console.log(` Manifest: ${manifestBefore} → ${Object.keys(manifest).length} entries`);
console.log("═══════════════════════════════════════════════");
