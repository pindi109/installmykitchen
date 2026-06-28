/**
 * IMK Comprehensive Image Generation — 3×3 Grid Strategy
 *
 * Each API call generates ONE 4K image containing a 3×3 grid of 9 distinct scenes.
 * All 9 cells are cropped, resized to target dimensions, and saved as WebP with
 * SEO-optimised filenames and alt text recorded in a manifest.
 *
 * Usage:
 *   FAL_KEY=xxx node scripts/generate-all-images.mjs
 *   FAL_KEY=xxx node scripts/generate-all-images.mjs --test        (1 grid only)
 *   FAL_KEY=xxx node scripts/generate-all-images.mjs --batch=0,1,3 (specific grids)
 *
 * Each grid call → 1 API request → 9 cropped images saved to public/assets/
 * 12 grids total → 108 images
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");
const MANIFEST  = join(ROOT, "src/data/image-manifest.json");

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("[FATAL] FAL_KEY not set"); process.exit(1); }

const FAL_URL     = "https://fal.run/fal-ai/nano-banana-pro";
const GRID_COLS   = 3;
const GRID_ROWS   = 3;
const CELL_FLOOR  = 600; // minimum px on short side of each cropped cell
const GRID_FLOOR  = 1800; // minimum px on short side of full grid

const PHOTO_STYLE = "real British homes and kitchens, natural daylight, premium cabinetry, editorial home-improvement photography, sharp focus, ultra-detailed, high resolution, not stock-photo cheesy, not AI-generated looking, no text, no logos, no watermarks, no borders between cells";

// ── Target output size per image slot ─────────────────────────────────────────
// All grids use 4:3 (gives ~1365×1024 cells at 4K, short side 1024px)
// We resize each cell to one of these targets:
const SIZES = {
  half:   { w: 680,  h: 510  },
  wide:   { w: 900,  h: 675  },
  square: { w: 560,  h: 420  },
  hero:   { w: 1200, h: 675  },
};

// ── 12 GRID DEFINITIONS ───────────────────────────────────────────────────────
// Each grid: 9 cells described in reading order (TL→TR, ML→MR, BL→BR)
// Each cell: { file: "path/to/filename.webp", size: keyof SIZES, alt: "..." }

const GRIDS = [

  // ── GRID 0: Installation Process Part 1 ─────────────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic images, evenly divided into nine equal cells (3 columns, 3 rows), no borders, no gaps between cells.
TOP-LEFT: A professional kitchen installer measuring a British kitchen empty room with a laser level tool. Dark plain workwear, no logos. Natural daylight.
TOP-CENTER: A kitchen fitter reviewing installation plans and drawings against an empty British kitchen. Clipboard, professional pose. Natural daylight.
TOP-RIGHT: Kitchen units in boxes being carefully checked and unpacked in a British home hallway. Professionally stacked, natural light.
MIDDLE-LEFT: Kitchen base cabinets being installed and levelled in a British home. Spirit level on white carcasses, adjustable feet visible. Natural daylight.
MIDDLE-CENTER: Kitchen wall cabinets being lifted and fixed to a British kitchen wall. Fitter in dark workwear, units aligned, natural daylight through window.
MIDDLE-RIGHT: Close-up of a kitchen worktop being measured and marked for cutting. Steel ruler, pencil line on laminate. Professional context.
BOTTOM-LEFT: Kitchen worktop being fitted onto base cabinets in a British home. Fitter positioning quartz worktop. Natural daylight.
BOTTOM-CENTER: Kitchen cabinet doors being hung and adjusted on concealed hinges. Fitter's hands aligning door precisely. Natural light.
BOTTOM-RIGHT: Close-up of brushed bar handles being fitted to kitchen cabinet doors. Drill and jig being used precisely. Professional installation.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "process/survey-measuring.webp",      size: "half",   alt: "Professional kitchen installer measuring room with laser level for pre-installation survey" },
      { file: "process/survey-planning.webp",        size: "half",   alt: "Kitchen installation professional reviewing plans and drawings against empty kitchen room" },
      { file: "process/delivery-checking.webp",      size: "half",   alt: "Kitchen units in boxes being carefully checked and unpacked before installation" },
      { file: "process/base-units-levelling.webp",   size: "wide",   alt: "Kitchen base cabinets being professionally installed and levelled with spirit level" },
      { file: "process/wall-units-fitting.webp",     size: "wide",   alt: "Kitchen wall cabinets being lifted and secured to British kitchen wall by professional fitter" },
      { file: "process/worktop-measuring.webp",      size: "half",   alt: "Kitchen worktop being carefully measured and marked for cutting" },
      { file: "process/worktop-fitting.webp",        size: "wide",   alt: "Kitchen worktop being professionally fitted onto base cabinets in British home" },
      { file: "process/doors-hanging.webp",          size: "half",   alt: "Kitchen cabinet doors being hung and adjusted on concealed Blum hinges by professional fitter" },
      { file: "process/handles-fitting.webp",        size: "half",   alt: "Brushed bar handles being fitted to kitchen cabinet doors using drill and template jig" },
    ],
  },

  // ── GRID 1: Installation Process Part 2 ─────────────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic images, evenly divided into nine equal cells, no borders, no gaps.
TOP-LEFT: Kitchen plinth panels being fitted at floor level beneath base units in a British home. Plinth clips engaged, clean floor reveal. Natural light.
TOP-CENTER: Kitchen cornice moulding being mitred and fitted to top of wall units. Precision mitre joints, professional British kitchen. Natural daylight.
TOP-RIGHT: Professional kitchen fitter doing final snagging inspection of completed British kitchen. Checking door alignment systematically. Natural light.
MIDDLE-LEFT: Wide view of beautifully completed modern British kitchen — white shaker doors, quartz worktop, integrated appliances, natural daylight from window.
MIDDLE-CENTER: Wide view of completed charcoal grey handleless kitchen in real British home. Integrated appliances, quartz worktop, under-cabinet lighting.
MIDDLE-RIGHT: Close-up of kitchen drawer opening smoothly on Blum Tandem runners. Soft-close mechanism, interior fittings visible, premium quality.
BOTTOM-LEFT: Integrated dishwasher being fitted into kitchen cabinetry with matching door panel. Flush finish with adjacent doors. Professional installation.
BOTTOM-CENTER: Kitchen installation professional at work fitting tall larder units in open plan British home. Natural daylight, focused, quality craftsmanship.
BOTTOM-RIGHT: Wide view of a large kitchen island being installed in a British detached home. Natural stone worktop, professional fitting in progress. Natural light.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "process/plinth-fitting.webp",         size: "half",   alt: "Kitchen plinth panels being fitted at floor level beneath base units, clean professional finish" },
      { file: "process/cornice-fitting.webp",        size: "half",   alt: "Kitchen cornice moulding being mitred and fitted to top of wall units, precision joints" },
      { file: "process/snagging-inspection.webp",    size: "wide",   alt: "Professional kitchen fitter doing final snagging inspection of completed British kitchen" },
      { file: "process/finished-kitchen-neutral.webp", size: "hero", alt: "Beautifully completed modern British kitchen with white shaker doors and quartz worktop" },
      { file: "process/finished-kitchen-dark.webp",  size: "hero",   alt: "Completed charcoal grey handleless kitchen in real British home with integrated appliances" },
      { file: "process/drawer-close-up.webp",        size: "half",   alt: "Kitchen drawer opening smoothly on Blum Tandem soft-close runners, premium quality detail" },
      { file: "process/appliance-integration.webp",  size: "half",   alt: "Integrated dishwasher fitted into kitchen cabinetry with matching furniture door panel flush" },
      { file: "process/tall-units-fitting.webp",     size: "half",   alt: "Kitchen fitter installing tall larder units in open plan British home kitchen" },
      { file: "process/island-installation.webp",    size: "wide",   alt: "Large kitchen island being professionally installed in British detached home with stone worktop" },
    ],
  },

  // ── GRID 2: Wren & Howdens Brand Kitchens ────────────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic kitchen images, evenly divided, no borders, no gaps.
TOP-LEFT: Wide view of completed Wren-style contemporary British kitchen with white gloss handleless doors, quartz worktop, integrated appliances. Natural daylight.
TOP-CENTER: Wren-style flat-pack kitchen carcasses being assembled and installed in a British home. Fitter in dark workwear, systematic installation.
TOP-RIGHT: Close-up of sleek handleless white kitchen cabinet doors with J-pull profile, premium gloss finish, precise alignment. British kitchen.
MIDDLE-LEFT: Completed Wren-style handleless kitchen with island unit, marble-effect quartz worktop and integrated Siemens appliances. Natural light.
MIDDLE-CENTER: Wide view of completed Howdens Greenwich Shaker kitchen in sage green with brass handles, oak-effect worktop, integrated appliances. British home.
MIDDLE-RIGHT: Rigid pre-assembled Howdens kitchen carcasses being installed in a British kitchen. Solid box construction visible, professional fitter working.
BOTTOM-LEFT: Close-up of a sage green Howdens shaker cabinet door with brushed brass cup handle. Premium painted finish, British kitchen setting.
BOTTOM-CENTER: Completed Howdens shaker kitchen — sage green painted doors, stone worktop, breakfast bar, integrated appliances. Natural daylight.
BOTTOM-RIGHT: Wide view of Howdens handleless contemporary kitchen in stone grey. Integrated appliances, quartz island, open plan British home.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "brand/wren/wren-kitchen-overview.webp",          size: "hero", alt: "Completed Wren contemporary kitchen with white gloss handleless doors and quartz worktop" },
      { file: "brand/wren/wren-installation-progress.webp",     size: "wide", alt: "Wren kitchen carcasses being assembled and installed in British home" },
      { file: "brand/wren/wren-handleless-doors.webp",          size: "half", alt: "Sleek handleless white Wren kitchen cabinet doors with J-pull profile, premium gloss finish" },
      { file: "brand/wren/wren-finished-result.webp",           size: "hero", alt: "Completed Wren handleless kitchen with marble quartz island and integrated Siemens appliances" },
      { file: "brand/howdens/howdens-kitchen-overview.webp",    size: "hero", alt: "Completed Howdens Greenwich Shaker kitchen in sage green with brass handles and oak worktop" },
      { file: "brand/howdens/howdens-rigid-units.webp",         size: "wide", alt: "Rigid pre-assembled Howdens kitchen carcasses being professionally installed" },
      { file: "brand/howdens/howdens-shaker-detail.webp",       size: "half", alt: "Sage green Howdens shaker cabinet door with brushed brass cup handle, premium painted finish" },
      { file: "brand/howdens/howdens-finished-result.webp",     size: "hero", alt: "Completed Howdens shaker kitchen with sage green doors, stone worktop and integrated appliances" },
      { file: "brand/howdens/howdens-contemporary.webp",        size: "hero", alt: "Howdens contemporary handleless kitchen in stone grey with quartz island and open plan layout" },
    ],
  },

  // ── GRID 3: IKEA & Magnet Brand Kitchens ────────────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic kitchen images, evenly divided, no borders, no gaps.
TOP-LEFT: Wide view of completed IKEA METOD kitchen with VOXTORP matt white doors, quartz worktop, British Victorian terrace context. Natural daylight.
TOP-CENTER: IKEA METOD kitchen flat-pack carcasses being assembled on site in a British home. Parts laid out, installation in progress systematically.
TOP-RIGHT: Close-up of IKEA METOD cabinet with Voxtorp matt white door. Clean Scandinavian minimal design, British kitchen setting.
MIDDLE-LEFT: Completed IKEA kitchen with Scandinavian minimal design, matt white doors, wood-effect worktop, integrated appliances. British home.
MIDDLE-CENTER: Wide view of Magnet Belgravia painted shaker kitchen in navy blue with quartz worktop and brass hardware. Real British home, natural daylight.
MIDDLE-RIGHT: Magnet kitchen rigid units being installed in a British home. Quality cabinetry installation in progress, professional fitter.
BOTTOM-LEFT: Close-up of Magnet painted in-frame style kitchen door in dark navy with brushed brass handle. Premium British kitchen.
BOTTOM-CENTER: Completed Magnet navy painted shaker kitchen with island, quartz worktop, range cooker, natural daylight. Real British home.
BOTTOM-RIGHT: Wide view of Magnet kitchen in warm sage green with handleless upper doors and shaker base doors, quartz worktop. British open-plan home.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "brand/ikea/ikea-kitchen-overview.webp",   size: "hero", alt: "Completed IKEA METOD kitchen with Voxtorp matt white doors and quartz worktop in Victorian terrace" },
      { file: "brand/ikea/ikea-flatpack-assembly.webp",  size: "wide", alt: "IKEA METOD kitchen flat-pack carcasses being assembled on site in British home" },
      { file: "brand/ikea/ikea-door-detail.webp",        size: "half", alt: "IKEA METOD cabinet with Voxtorp matt white door, clean Scandinavian minimal design" },
      { file: "brand/ikea/ikea-finished-result.webp",    size: "hero", alt: "Completed IKEA kitchen with Scandinavian minimal design, matt white doors and wood-effect worktop" },
      { file: "brand/magnet/magnet-kitchen-overview.webp", size: "hero", alt: "Magnet Belgravia painted shaker kitchen in navy blue with brass hardware and quartz worktop" },
      { file: "brand/magnet/magnet-installation.webp",   size: "wide", alt: "Magnet kitchen rigid units being professionally installed in British home" },
      { file: "brand/magnet/magnet-door-detail.webp",    size: "half", alt: "Magnet painted in-frame kitchen door in dark navy with brushed brass handle, premium finish" },
      { file: "brand/magnet/magnet-finished-result.webp", size: "hero", alt: "Completed Magnet navy painted shaker kitchen with island, quartz worktop and range cooker" },
      { file: "brand/magnet/magnet-contemporary.webp",   size: "hero", alt: "Magnet kitchen in warm sage green with mixed handleless and shaker doors, quartz worktop" },
    ],
  },

  // ── GRID 4: Shaker & Handleless Kitchens ─────────────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic kitchen images, evenly divided, no borders, no gaps.
TOP-LEFT: Wide view of classic cream shaker kitchen in a real British home. Recessed panel doors, cup handles, wood worktop, natural daylight.
TOP-CENTER: Close-up of white painted shaker kitchen door with recessed centre panel and brushed brass handle. Classic British kitchen craftsmanship.
TOP-RIGHT: Shaker kitchen cabinet units being professionally fitted in a British home. Installation in progress, natural daylight through window.
MIDDLE-LEFT: Completed sage green shaker kitchen — painted doors, quartz worktop, brass fixtures, Belfast sink, real British Victorian home.
MIDDLE-CENTER: Shaker kitchen in a Victorian British terrace house. Traditional proportions, cream doors, butler's sink, original features visible.
MIDDLE-RIGHT: Wide view of sleek charcoal handleless kitchen in a modern British home extension. J-pull profile doors, quartz worktop, integrated appliances.
BOTTOM-LEFT: Close-up of dark grey handleless kitchen cabinet doors with J-pull profile. Premium matt finish, precise alignment. Real British kitchen.
BOTTOM-CENTER: Handleless kitchen cabinets being installed. Precision fitting of J-pull door profile. Modern British home. Professional installation.
BOTTOM-RIGHT: Completed dark charcoal handleless kitchen with waterfall island, Dekton worktop, integrated appliances, British open-plan home.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "styles/shaker/shaker-overview.webp",        size: "hero", alt: "Classic cream shaker kitchen in real British home with recessed panel doors and wood worktop" },
      { file: "styles/shaker/shaker-door-detail.webp",     size: "half", alt: "White painted shaker kitchen door with recessed centre panel and brushed brass handle" },
      { file: "styles/shaker/shaker-installation.webp",    size: "wide", alt: "Shaker kitchen cabinet units being professionally fitted in British home" },
      { file: "styles/shaker/shaker-finished-result.webp", size: "hero", alt: "Completed sage green shaker kitchen with painted doors, quartz worktop and brass fixtures" },
      { file: "styles/shaker/shaker-in-period-home.webp",  size: "half", alt: "Shaker kitchen in Victorian British terrace with cream doors, butler's sink and period features" },
      { file: "styles/handleless/handleless-overview.webp", size: "hero", alt: "Sleek charcoal handleless kitchen in modern British home extension with quartz worktop" },
      { file: "styles/handleless/handleless-door-detail.webp", size: "half", alt: "Dark grey handleless kitchen cabinet doors with J-pull profile, premium matt finish" },
      { file: "styles/handleless/handleless-installation.webp", size: "wide", alt: "Handleless kitchen cabinets being professionally installed in British home" },
      { file: "styles/handleless/handleless-finished-result.webp", size: "hero", alt: "Completed charcoal handleless kitchen with waterfall island and Dekton worktop" },
    ],
  },

  // ── GRID 5: German, In-Frame & Painted Kitchens ──────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic kitchen images, evenly divided, no borders, no gaps.
TOP-LEFT: Wide view of premium German precision kitchen — handleless lacquer doors, stone worktop, Miele integrated appliances, real British luxury home.
TOP-CENTER: Close-up of premium German kitchen cabinet hinge and soft-close mechanism — Blum engineering, immaculate precision fit. Professional installation.
TOP-RIGHT: Completed premium German handleless kitchen — high gloss lacquer, natural stone worktop, seamless integration, professional photography. Real home.
MIDDLE-LEFT: Wide view of traditional British in-frame painted kitchen — sage green, face-frame construction, solid timber, Shaker style, real British home.
MIDDLE-CENTER: Close-up of an in-frame kitchen door set within solid timber face-frame. Traditional British craftsmanship, painted finish, period home setting.
MIDDLE-RIGHT: Completed in-frame painted kitchen in a large British farmhouse. Traditional proportions, painted doors, stone worktop, flagstone floor.
BOTTOM-LEFT: Wide view of hand-painted kitchen in deep navy blue with brass handles and marble quartz worktop. Real British period home, natural daylight.
BOTTOM-CENTER: Close-up of hand-painted kitchen cabinet door in deep sage green. Smooth eggshell paint finish, brass knob handle. Premium British kitchen.
BOTTOM-RIGHT: Completed two-tone painted kitchen — navy lower units, cream upper units, marble worktop, brass fixtures, real British family home.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "styles/german/german-overview.webp",          size: "hero", alt: "Premium German precision kitchen with handleless lacquer doors and natural stone worktop" },
      { file: "styles/german/german-engineering-detail.webp", size: "half", alt: "Premium German kitchen Blum soft-close hinge and hardware, precision engineering detail" },
      { file: "styles/german/german-finished-result.webp",   size: "hero", alt: "Completed premium German handleless kitchen with high gloss lacquer and stone worktop" },
      { file: "styles/in-frame/in-frame-overview.webp",      size: "hero", alt: "Traditional British in-frame painted kitchen in sage green with solid timber face-frame" },
      { file: "styles/in-frame/in-frame-construction-detail.webp", size: "half", alt: "In-frame kitchen door set within solid timber face-frame, traditional British craftsmanship" },
      { file: "styles/in-frame/in-frame-finished-result.webp", size: "hero", alt: "Completed in-frame painted kitchen in British farmhouse with traditional proportions and stone worktop" },
      { file: "styles/painted/painted-overview.webp",        size: "hero", alt: "Hand-painted navy kitchen with brass handles and marble quartz worktop in British period home" },
      { file: "styles/painted/painted-door-detail.webp",     size: "half", alt: "Hand-painted sage green kitchen cabinet door with smooth eggshell finish and brass knob handle" },
      { file: "styles/painted/painted-finished-result.webp", size: "hero", alt: "Completed two-tone painted kitchen with navy lower and cream upper units, marble worktop" },
    ],
  },

  // ── GRID 6: Luxury, Solid Wood & Modern Kitchens ────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic kitchen images, evenly divided, no borders, no gaps.
TOP-LEFT: Wide view of high-end luxury British kitchen — Neptune or Tom Howley style, hand-painted in-frame doors, marble or Dekton worktop, designer fixtures.
TOP-CENTER: Close-up of luxury kitchen cabinetry details — fluted pilaster, hand-painted finish, premium brass hardware, marble worktop edge. Bespoke British.
TOP-RIGHT: Completed luxury kitchen in large British home — bespoke painted cabinetry, marble island, premium Miele appliances. Professional editorial photography.
MIDDLE-LEFT: Wide view of contemporary British kitchen — flat slab doors in warm taupe, integrated handles, stone worktop, minimal design. Natural daylight.
MIDDLE-CENTER: Wide view of traditional British kitchen — cream Shaker doors, wooden worktop, range cooker, butler's sink, period home. Natural daylight.
MIDDLE-RIGHT: Wide view of modern sleek British kitchen — gloss white slab doors, waterfall island, stainless steel appliances. Bright natural light.
BOTTOM-LEFT: Close-up of premium solid wood kitchen cabinet door. Natural oak grain detail, British kitchen. Editorial quality photography.
BOTTOM-CENTER: Solid wood kitchen in a British period property — warm oak units, wooden worktop, natural stone floor. Real home, natural daylight.
BOTTOM-RIGHT: Wide view of open-plan British kitchen-diner with large island, bifold doors to garden. Contemporary design, natural light flooding in.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "styles/luxury/luxury-overview.webp",          size: "hero", alt: "High-end luxury British kitchen with hand-painted in-frame doors and marble Dekton worktop" },
      { file: "styles/luxury/luxury-detail.webp",            size: "half", alt: "Luxury kitchen bespoke cabinetry detail with fluted pilaster, brass hardware and marble edge" },
      { file: "styles/luxury/luxury-finished-result.webp",   size: "hero", alt: "Completed luxury kitchen in large British home with bespoke painted cabinetry and marble island" },
      { file: "styles/contemporary/contemporary-overview.webp", size: "hero", alt: "Contemporary British kitchen with flat slab taupe doors and stone worktop" },
      { file: "styles/traditional/traditional-overview.webp", size: "hero", alt: "Traditional British kitchen with cream Shaker doors, wooden worktop and range cooker" },
      { file: "styles/modern/modern-overview.webp",          size: "hero", alt: "Modern sleek British kitchen with gloss white slab doors and waterfall island" },
      { file: "styles/solid-wood/solid-wood-door-detail.webp", size: "half", alt: "Premium solid wood kitchen cabinet door with natural oak grain, British kitchen" },
      { file: "styles/solid-wood/solid-wood-kitchen.webp",   size: "hero", alt: "Solid wood kitchen in British period property with warm oak units and wooden worktop" },
      { file: "styles/modern/modern-open-plan.webp",         size: "hero", alt: "Open-plan British kitchen-diner with large island and bifold doors to garden" },
    ],
  },

  // ── GRID 7: Door & Drawer Repairs ────────────────────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic kitchen repair images, evenly divided, no borders, no gaps.
TOP-LEFT: Kitchen cabinet door hanging badly misaligned, visibly warped, sagging on broken hinges. British kitchen, problem clearly visible. Natural light.
TOP-CENTER: Professional kitchen fitter hanging a new replacement kitchen door and adjusting it on concealed hinges. Repair in progress. Natural light.
TOP-RIGHT: Set of beautifully aligned new kitchen cabinet doors — perfectly hung, even gaps, professional finish. Before and after repair result.
MIDDLE-LEFT: Close-up of Blum kitchen cabinet hinge being adjusted with a screwdriver. Three-way adjustment visible, professional repair technique.
MIDDLE-CENTER: Close-up of modern Blum soft-close concealed hinge on kitchen cabinet door. Premium hardware, detailed engineering view. British kitchen.
MIDDLE-RIGHT: Sticking or misaligned kitchen drawer that won't close properly in a real British kitchen. The problem clearly visible. Natural daylight.
BOTTOM-LEFT: Close-up of Blum Tandem drawer runner being installed inside kitchen cabinet. Professional drawer runner replacement in progress.
BOTTOM-CENTER: Kitchen drawers opening fully and smoothly with soft-close mechanism. Perfect alignment, professional finish after repair.
BOTTOM-RIGHT: Kitchen worktop joint repair in progress — router cutting a new precision joint. Professional worktop repair technique.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "repairs/door-replacement/door-before.webp",  size: "half", alt: "Kitchen cabinet door hanging misaligned, warped and sagging on broken hinges — problem before repair" },
      { file: "repairs/door-replacement/door-during.webp",  size: "half", alt: "Professional kitchen fitter hanging new replacement door and adjusting on concealed hinges" },
      { file: "repairs/door-replacement/door-after.webp",   size: "wide", alt: "Set of beautifully aligned new kitchen cabinet doors with perfect even gaps after professional repair" },
      { file: "repairs/hinge-upgrade/hinge-close-up.webp",  size: "half", alt: "Blum kitchen cabinet hinge being adjusted with screwdriver, three-way adjustment technique" },
      { file: "repairs/hinge-upgrade/softclose-hinge.webp", size: "half", alt: "Modern Blum soft-close concealed hinge on kitchen cabinet door, premium engineering detail" },
      { file: "repairs/drawer-repair/drawer-before.webp",   size: "half", alt: "Sticking kitchen drawer that won't close properly in British kitchen — problem before repair" },
      { file: "repairs/drawer-repair/drawer-runner-fitting.webp", size: "half", alt: "Blum Tandem drawer runner being professionally installed inside kitchen cabinet" },
      { file: "repairs/drawer-repair/drawer-after.webp",    size: "half", alt: "Kitchen drawers opening smoothly and fully on soft-close runners after professional repair" },
      { file: "repairs/worktop-work/worktop-joint-repair.webp", size: "half", alt: "Kitchen worktop joint repair in progress with router cutting new precision joint" },
    ],
  },

  // ── GRID 8: Trims, Snagging & Other Repairs ──────────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic kitchen repair images, evenly divided, no borders, no gaps.
TOP-LEFT: Kitchen plinth panels being fitted at floor level — plinth clips engaged, clean finish at floor junction. Real British kitchen. Natural light.
TOP-CENTER: Kitchen cornice moulding being mitred and fitted at top of wall units. Precision cutting and joining. Professional finish. Natural light.
TOP-RIGHT: Kitchen end panel being scribed to uneven wall and fitted. Scribing jig visible, exposed cabinet side being professionally finished.
MIDDLE-LEFT: Integrated dishwasher furniture panel door being refitted and realigned. Door slider mechanism being adjusted. Professional repair.
MIDDLE-CENTER: Kitchen doors in poor alignment — uneven gaps, misaligned, not closing flush. The snagging problem before repair. Natural daylight.
MIDDLE-RIGHT: Kitchen doors in perfect alignment after professional snagging — even gaps, flush close, perfect reveal across entire kitchen run.
BOTTOM-LEFT: Close-up of a perfectly sealed flush kitchen worktop join after professional repair. No visible gap, watertight finish. British kitchen.
BOTTOM-CENTER: Professional kitchen fitter adjusting kitchen unit alignment and snagging. Systematic quality check, real British kitchen. Natural daylight.
BOTTOM-RIGHT: Wide view of completed British kitchen after professional snagging and repair — every door, drawer and trim perfectly set. Natural light.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "repairs/plinth-pelmet/plinth-fitting.webp",    size: "half", alt: "Kitchen plinth panels being fitted at floor level with plinth clips, clean professional finish" },
      { file: "repairs/plinth-pelmet/cornice-fitting.webp",   size: "half", alt: "Kitchen cornice moulding being mitred and fitted to wall unit tops, precision professional finish" },
      { file: "repairs/end-panel/end-panel-scribing.webp",    size: "half", alt: "Kitchen end panel being scribed to uneven wall and professionally fitted" },
      { file: "repairs/appliance-door/appliance-door-repair.webp", size: "half", alt: "Integrated dishwasher furniture panel door being refitted and realigned, slider adjustment" },
      { file: "repairs/adjustment-snag/snagging-before.webp", size: "half", alt: "Kitchen doors in poor alignment with uneven gaps, not closing flush — snagging problem before repair" },
      { file: "repairs/adjustment-snag/snagging-after.webp",  size: "wide", alt: "Kitchen doors in perfect alignment after professional snagging — even gaps, flush close" },
      { file: "repairs/worktop-work/worktop-after.webp",      size: "half", alt: "Perfectly sealed flush kitchen worktop joint after professional repair, watertight finish" },
      { file: "repairs/adjustment-snag/unit-adjustment.webp", size: "half", alt: "Professional kitchen fitter adjusting unit alignment during systematic snagging inspection" },
      { file: "repairs/door-replacement/kitchen-repaired-result.webp", size: "hero", alt: "Completed British kitchen after professional snagging and repair, every element perfectly set" },
    ],
  },

  // ── GRID 9: Appliance Installation ──────────────────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic kitchen appliance installation images, evenly divided, no borders, no gaps.
TOP-LEFT: Integrated dishwasher being installed into kitchen cabinetry housing. Fitter setting it level, connecting supply lines. British kitchen. Natural light.
TOP-CENTER: Integrated dishwasher with matching furniture panel door fitted flush with adjacent cabinet doors. Perfect alignment. British kitchen.
TOP-RIGHT: Integrated fridge-freezer being slid into tall kitchen housing unit. Fitter positioning appliance. British kitchen setting. Natural daylight.
MIDDLE-LEFT: Integrated fridge with tall decor panel door fitted, matching surrounding kitchen cabinets perfectly. Real British kitchen. Natural light.
MIDDLE-CENTER: Integrated washing machine being installed under kitchen worktop in British home. Connecting hoses, positioning in housing. Natural daylight.
MIDDLE-RIGHT: Integrated oven being installed into tall kitchen housing unit. Fitter connecting power. Real British kitchen. Natural daylight.
BOTTOM-LEFT: Wide view of complete British kitchen with all integrated appliances — dishwasher, fridge freezer, oven — all with matching door panels. Natural light.
BOTTOM-CENTER: Close-up of appliance door panel slider mechanism being adjusted. Precision fitting, professional appliance integration. British kitchen.
BOTTOM-RIGHT: Professional kitchen fitter testing integrated appliances after installation. Quality check, all appliances operating. British kitchen.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "appliances/dishwasher/dishwasher-installation.webp", size: "half", alt: "Integrated dishwasher being installed into kitchen cabinetry housing, fitter connecting supply lines" },
      { file: "appliances/dishwasher/dishwasher-door-panel.webp",   size: "half", alt: "Integrated dishwasher with furniture panel door fitted flush with adjacent cabinet doors" },
      { file: "appliances/fridge/fridge-installation.webp",         size: "half", alt: "Integrated fridge-freezer being slid into tall kitchen housing unit by professional fitter" },
      { file: "appliances/fridge/fridge-panel-fitted.webp",         size: "half", alt: "Integrated fridge with tall decor panel door fitted, matching surrounding kitchen cabinets" },
      { file: "appliances/washing-machine/washing-machine-installation.webp", size: "half", alt: "Integrated washing machine being installed under kitchen worktop, connecting hoses" },
      { file: "appliances/oven/oven-installation.webp",             size: "half", alt: "Integrated oven being installed into tall kitchen housing unit, fitter connecting power" },
      { file: "appliances/appliances-overview.webp",                size: "hero", alt: "Complete British kitchen with all integrated appliances fitted with matching furniture door panels" },
      { file: "appliances/appliance-door-detail.webp",              size: "half", alt: "Appliance door panel slider mechanism being adjusted for precision flush fitting" },
      { file: "appliances/appliances-testing.webp",                 size: "half", alt: "Professional kitchen fitter testing integrated appliances after installation, quality check" },
    ],
  },

  // ── GRID 10: Services ─────────────────────────────────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic kitchen service images, evenly divided, no borders, no gaps.
TOP-LEFT: Wide view of kitchen base and wall units being professionally installed and levelled in a British home. All carcasses in position systematically.
TOP-CENTER: Kitchen base unit being precisely levelled using adjustable feet and spirit level. Foundation of professional kitchen installation.
TOP-RIGHT: Wide view of kitchen worktop being professionally measured, marked and cut to length. Professional fitter, clean workspace. Natural light.
MIDDLE-LEFT: Close-up of precision router worktop joint — two sections of laminate worktop joined seamlessly at corner. Watertight professional finish.
MIDDLE-CENTER: Wide view of integrated kitchen appliances being professionally fitted in sequence — dishwasher, oven and fridge being installed together.
MIDDLE-RIGHT: Wide view of complete set of kitchen doors being hung, adjusted and aligned by professional fitter. Perfect reveal across entire kitchen.
BOTTOM-LEFT: Wide view showing kitchen plinth, cornice and pelmet all being fitted to complete the kitchen. Professional finishing details being added.
BOTTOM-CENTER: Kitchen with handles being systematically fitted using template — precise positioning, all handles perfectly aligned across the kitchen.
BOTTOM-RIGHT: Wide view of kitchen floor tiles being professionally laid in a British home. Tile spacers, adhesive, perfectly level floor preparation.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "services/cabinet-installation/cabinet-installation-overview.webp", size: "hero", alt: "Kitchen base and wall units being professionally installed and levelled in British home" },
      { file: "services/cabinet-installation/cabinet-levelling.webp",             size: "half", alt: "Kitchen base unit being precisely levelled using adjustable feet and spirit level" },
      { file: "services/worktop-fitting/worktop-cutting.webp",                    size: "hero", alt: "Kitchen worktop being professionally measured, marked and cut to length" },
      { file: "services/worktop-fitting/worktop-joint.webp",                      size: "half", alt: "Precision router worktop joint — two laminate sections joined seamlessly at corner" },
      { file: "services/appliance-installation/appliance-svc-overview.webp",      size: "hero", alt: "Integrated kitchen appliances being professionally fitted in sequence" },
      { file: "services/door-fitting/door-fitting-overview.webp",                 size: "hero", alt: "Complete set of kitchen doors being hung, adjusted and aligned by professional fitter" },
      { file: "services/trims-and-plinths/trims-plinth-overview.webp",            size: "hero", alt: "Kitchen plinth, cornice and pelmet being fitted to complete professional kitchen finish" },
      { file: "services/handles-and-ironmongery/handles-fitting.webp",            size: "hero", alt: "Kitchen handles being systematically fitted using template, all perfectly aligned" },
      { file: "services/flooring-tiling/flooring-tiling-overview.webp",           size: "hero", alt: "Kitchen floor tiles being professionally laid in British home, perfectly level" },
    ],
  },

  // ── GRID 11: Property Types & Snagging/Services ──────────────────────────────
  {
    prompt: `A 3x3 grid of nine distinct photorealistic images, evenly divided, no borders, no gaps.
TOP-LEFT: Kitchen installed in a Victorian British terraced house. Period cornicing, sash windows, fitted kitchen within. Natural daylight. Real home.
TOP-CENTER: Fitted kitchen in a typical British 1960s semi-detached home. Modern kitchen in post-war property setting. Natural daylight.
TOP-RIGHT: Fitted kitchen in a modern British new-build home. Clean contemporary property, bright natural light, handleless kitchen.
MIDDLE-LEFT: Large kitchen in a British detached house. Open plan kitchen-diner, island unit, bifold doors to garden. Natural light flooding in.
MIDDLE-CENTER: Kitchen in a British Edwardian or Georgian period property. High ceilings, bay window, traditional painted kitchen. Natural light.
MIDDLE-RIGHT: Premium kitchen in an executive British home. High specification German or luxury kitchen, professional photography. Natural daylight.
BOTTOM-LEFT: Kitchen in a British rural cottage. Low ceiling, exposed beams, traditional painted kitchen, flagstone or slate floor. Natural light.
BOTTOM-CENTER: Fitted kitchen in a British city centre apartment. Compact efficient layout, modern handleless units, integrated appliances.
BOTTOM-RIGHT: Wide view of professional kitchen fitter doing snagging — opening every drawer, checking every door systematically. Natural daylight.
STYLE: ${PHOTO_STYLE}.`,
    aspect_ratio: "4:3",
    cells: [
      { file: "property/victorian-terrace-kitchen.webp",    size: "half", alt: "Kitchen installed in Victorian British terraced house with period cornicing and sash windows" },
      { file: "property/semi-detached-kitchen.webp",        size: "half", alt: "Fitted kitchen in typical British 1960s semi-detached home, modern kitchen in period property" },
      { file: "property/new-build-kitchen.webp",            size: "half", alt: "Fitted kitchen in modern British new-build home with bright natural light and handleless design" },
      { file: "property/detached-house-kitchen.webp",       size: "hero", alt: "Large kitchen in British detached house with open-plan kitchen-diner, island unit and bifold doors" },
      { file: "property/period-property-kitchen.webp",      size: "half", alt: "Kitchen in British Edwardian period property with high ceilings, bay window and traditional painted kitchen" },
      { file: "property/berkshire-executive-kitchen.webp",  size: "hero", alt: "Premium kitchen in executive Berkshire home with high specification German cabinetry" },
      { file: "property/cottage-kitchen.webp",              size: "half", alt: "Kitchen in British rural cottage with exposed beams, traditional painted kitchen and flagstone floor" },
      { file: "property/apartment-kitchen.webp",            size: "half", alt: "Fitted kitchen in British city centre apartment with compact efficient layout and integrated appliances" },
      { file: "services/snagging/snagging-overview.webp",   size: "hero", alt: "Professional kitchen fitter doing systematic snagging inspection — checking every door and drawer" },
    ],
  },

];

// ── fal.ai call ───────────────────────────────────────────────────────────────
async function callFal(prompt, aspect_ratio) {
  const res = await fetch(FAL_URL, {
    method: "POST",
    headers: { "Authorization": `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspect_ratio, resolution: "4K", num_images: 1, output_format: "png" }),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`fal ${res.status}: ${t}`); }
  const data = await res.json();
  const img = data?.images?.[0];
  if (!img?.url) throw new Error(`no image in response: ${JSON.stringify(data).slice(0,200)}`);

  const dlRes = await fetch(img.url);
  if (!dlRes.ok) throw new Error(`download failed: ${dlRes.status}`);
  const buf = Buffer.from(await dlRes.arrayBuffer());
  const meta = await sharp(buf).metadata();
  const short = Math.min(meta.width, meta.height);
  console.log(`  grid: ${meta.width}×${meta.height}px  short=${short}px`);
  if (short < GRID_FLOOR) throw new Error(`grid too small: ${short}px`);
  return { buf, width: meta.width, height: meta.height };
}

// ── Crop one cell from grid ───────────────────────────────────────────────────
async function cropCell(buf, gridW, gridH, row, col, sizeCfg) {
  const cW = Math.floor(gridW / GRID_COLS);
  const cH = Math.floor(gridH / GRID_ROWS);
  const x = col * cW;
  const y = row * cH;
  if (Math.min(cW, cH) < CELL_FLOOR) throw new Error(`cell too small: ${cW}×${cH}`);
  const cell = await sharp(buf).extract({ left: x, top: y, width: cW, height: cH }).toBuffer();
  return sharp(cell).resize(sizeCfg.w, sizeCfg.h, { fit: "cover", position: "centre" }).webp({ quality: 82 }).toBuffer();
}

// ── Load / save manifest ──────────────────────────────────────────────────────
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
function saveManifest() { writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n"); }

// ── Main ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const TEST = args.includes("--test");
const BATCH_ARG = (args.find(a => a.startsWith("--batch=")) || "").replace("--batch=", "");
const BATCH_INDICES = BATCH_ARG ? BATCH_ARG.split(",").map(Number) : GRIDS.map((_, i) => i);
const gridsToRun = TEST ? [GRIDS[0]] : BATCH_INDICES.map(i => GRIDS[i]).filter(Boolean);

console.log(`\n${"═".repeat(60)}`);
console.log(` IMK Image Generation — 3×3 Grid Strategy`);
console.log(` Grids: ${gridsToRun.length}  |  Images: ~${gridsToRun.length * 9}`);
console.log(` Mode: ${TEST ? "TEST (grid 0 only)" : "FULL"}`);
console.log(`${"═".repeat(60)}\n`);

let ok = 0, skip = 0, fail = 0;

for (let gi = 0; gi < gridsToRun.length; gi++) {
  const grid = gridsToRun[gi];
  console.log(`\n▶ Grid ${BATCH_INDICES[gi] ?? gi} — ${grid.cells[0].file.split("/")[0]}/...`);

  // Skip if all 9 cells exist
  const allExist = grid.cells.every(c => existsSync(join(ROOT, "public/assets", c.file)));
  if (allExist) {
    console.log(`  [skip] all 9 cells already exist`);
    skip += 9;
    continue;
  }

  let gridImg;
  try {
    gridImg = await callFal(grid.prompt, grid.aspect_ratio);
  } catch (err) {
    console.error(`  [ERR] API call failed: ${err.message}`);
    fail += 9;
    continue;
  }

  // Crop and save all 9 cells
  for (let i = 0; i < grid.cells.length; i++) {
    const cell = grid.cells[i];
    const row = Math.floor(i / GRID_COLS);
    const col = i % GRID_COLS;
    const outPath = join(ROOT, "public/assets", cell.file);
    const pubPath = `/assets/${cell.file}`;

    if (existsSync(outPath)) {
      console.log(`  [skip] ${cell.file}`);
      manifest[cell.file] = { path: pubPath, alt: cell.alt };
      skip++;
      continue;
    }

    try {
      mkdirSync(outPath.split("/").slice(0,-1).join("/"), { recursive: true });
      const cellBuf = await cropCell(gridImg.buf, gridImg.width, gridImg.height, row, col, SIZES[cell.size]);
      writeFileSync(outPath, cellBuf);
      manifest[cell.file] = { path: pubPath, alt: cell.alt };
      saveManifest();
      console.log(`  → ${cell.file} (${SIZES[cell.size].w}×${SIZES[cell.size].h})`);
      ok++;
    } catch (err) {
      console.error(`  [ERR] cell ${i} (${cell.file}): ${err.message}`);
      fail++;
    }
  }
}

saveManifest();
console.log(`\n${"═".repeat(60)}`);
console.log(` Done: ${ok} generated, ${skip} skipped, ${fail} failed`);
console.log(` Manifest: ${Object.keys(manifest).length} entries`);
console.log(`${"═".repeat(60)}\n`);
