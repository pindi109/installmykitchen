/**
 * IMK Comprehensive Image Generation
 * Generates all themed image sets needed across the full site.
 * Usage: FAL_KEY=xxx node scripts/generate-all-images.mjs [--test] [--batch=process|brands|styles|repairs|appliances|services|property]
 *
 * Images organised as:
 *   /assets/process/         — shared installation process images
 *   /assets/brand/[brand]/   — brand-specific kitchen images
 *   /assets/styles/[style]/  — style-specific images
 *   /assets/repairs/[group]/ — repair job images
 *   /assets/appliances/[type]/ — appliance images
 *   /assets/services/[svc]/  — service process images
 *   /assets/property/        — property type images
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("[FATAL] FAL_KEY not set"); process.exit(1); }

const FAL_URL = "https://fal.run/fal-ai/nano-banana-pro";
const MAX_PER_CALL = 4;
const GRID_MIN_SHORT = 1800;

const args = process.argv.slice(2);
const TEST_MODE = args.includes("--test");
const BATCH_ARG = (args.find(a => a.startsWith("--batch=")) || "").replace("--batch=", "") || "all";

// ── Image sizes ───────────────────────────────────────────────────────────────
const SIZES = {
  hero:    { ratio: "16:9", w: 1200, h: 675,  quadrantFloor: 1024 },
  wide:    { ratio: "16:9", w: 900,  h: 506,  quadrantFloor: 1024 },
  half:    { ratio: "4:3",  w: 680,  h: 510,  quadrantFloor: 600  },
  square:  { ratio: "4:3",  w: 560,  h: 420,  quadrantFloor: 600  },
  tall:    { ratio: "9:16", w: 420,  h: 747,  quadrantFloor: 960  },
};

// ── Shared style for all prompts ──────────────────────────────────────────────
const PHOTO_STYLE = "real British homes, natural daylight, premium cabinetry, editorial home-improvement photography, sharp focus, ultra-detailed, crisp, high resolution, not stock-photo cheesy, not obviously AI, no text, no logos, no watermarks";

// ── BATCH DEFINITIONS ─────────────────────────────────────────────────────────

const BATCHES = {

  // ── PROCESS: shared installation steps ──────────────────────────────────────
  process: [
    {
      slug: "survey-measuring",
      dir: "process",
      size: "half",
      prompt: `A photorealistic image of a professional kitchen installer measuring a British kitchen with a laser level measuring tool. The fitter wears plain dark workwear with no logos, focused expression, empty kitchen ready for installation. Natural daylight. ${PHOTO_STYLE}.`,
    },
    {
      slug: "survey-planning",
      dir: "process",
      size: "half",
      prompt: `A photorealistic image of a kitchen installation professional reviewing kitchen plans and drawings against an empty British kitchen room. Clipboard with drawings, professional assessment pose. Natural daylight. ${PHOTO_STYLE}.`,
    },
    {
      slug: "delivery-checking",
      dir: "process",
      size: "half",
      prompt: `A photorealistic image of kitchen units in boxes being carefully checked and unpacked in a British home hallway. Professionally stacked flat-pack and rigid boxes, cardboard protection. Natural light. ${PHOTO_STYLE}.`,
    },
    {
      slug: "base-units-levelling",
      dir: "process",
      size: "wide",
      prompt: `A photorealistic image of base kitchen cabinets being installed and levelled in a British home. Fitter using a spirit level on white kitchen carcasses, adjustable feet being set. Empty room, natural daylight. ${PHOTO_STYLE}.`,
    },
    {
      slug: "wall-units-fitting",
      dir: "process",
      size: "wide",
      prompt: `A photorealistic image of wall kitchen cabinets being lifted and secured to a British kitchen wall. Fitter in dark workwear, units aligned and clamped, natural daylight through window. ${PHOTO_STYLE}.`,
    },
    {
      slug: "worktop-measuring",
      dir: "process",
      size: "half",
      prompt: `A photorealistic close-up of a kitchen worktop being carefully measured and marked for cutting. Steel ruler, pencil line on laminate worktop, professional kitchen installation context. ${PHOTO_STYLE}.`,
    },
    {
      slug: "worktop-fitting",
      dir: "process",
      size: "wide",
      prompt: `A photorealistic image of a kitchen worktop being fitted onto base cabinets. Fitter positioning quartz or laminate worktop, screwing from beneath. British kitchen setting, natural daylight. ${PHOTO_STYLE}.`,
    },
    {
      slug: "doors-hanging",
      dir: "process",
      size: "half",
      prompt: `A photorealistic image of kitchen cabinet doors being hung and adjusted on Blum concealed hinges. Fitter's hands aligning door perfectly, kitchen installation in progress. ${PHOTO_STYLE}.`,
    },
    {
      slug: "handles-fitting",
      dir: "process",
      size: "half",
      prompt: `A photorealistic close-up of brushed stainless steel bar handles being fitted to kitchen cabinet doors. Drill and template being used precisely, professional installation. ${PHOTO_STYLE}.`,
    },
    {
      slug: "plinth-fitting",
      dir: "process",
      size: "half",
      prompt: `A photorealistic image of white kitchen plinth panels being fitted at floor level beneath base units. Plinth clips being engaged, clean floor reveal. British kitchen, natural light. ${PHOTO_STYLE}.`,
    },
    {
      slug: "cornice-fitting",
      dir: "process",
      size: "half",
      prompt: `A photorealistic image of kitchen cornice moulding being fitted to the top of wall units. Mitre joints, professional finish at ceiling junction, British kitchen setting. ${PHOTO_STYLE}.`,
    },
    {
      slug: "snagging-inspection",
      dir: "process",
      size: "wide",
      prompt: `A photorealistic image of a professional kitchen fitter doing a final snagging inspection of a completed British kitchen. Checking door alignment, opening drawers, reviewing quality systematically. ${PHOTO_STYLE}.`,
    },
    {
      slug: "finished-kitchen-neutral",
      dir: "process",
      size: "hero",
      prompt: `A photorealistic wide view of a beautifully completed modern British kitchen — white shaker doors, quartz worktop, integrated appliances, soft natural daylight from window. Professional home-improvement photography. ${PHOTO_STYLE}.`,
    },
    {
      slug: "finished-kitchen-dark",
      dir: "process",
      size: "hero",
      prompt: `A photorealistic wide view of a completed charcoal grey handleless kitchen in a real British home. Integrated appliances, quartz worktop, under-cabinet lighting, natural daylight. ${PHOTO_STYLE}.`,
    },
    {
      slug: "drawer-close-up",
      dir: "process",
      size: "square",
      prompt: `A photorealistic close-up of a kitchen drawer being opened smoothly on Blum Tandem runners. Soft-close mechanism, interior fittings visible, premium kitchen installation quality. ${PHOTO_STYLE}.`,
    },
    {
      slug: "appliance-integration",
      dir: "process",
      size: "half",
      prompt: `A photorealistic image of an integrated dishwasher or oven being fitted into kitchen cabinetry with matching door panel. Flush finish with adjacent doors, professional installation. ${PHOTO_STYLE}.`,
    },
  ],

  // ── BRANDS ───────────────────────────────────────────────────────────────────
  brands: [
    // Wren
    { slug: "wren-kitchen-overview", dir: "brand/wren", size: "hero",
      prompt: `Photorealistic wide view of a finished Wren-style contemporary British kitchen. White gloss handleless doors, quartz worktop, integrated appliances. ${PHOTO_STYLE}.` },
    { slug: "wren-installation-progress", dir: "brand/wren", size: "wide",
      prompt: `Photorealistic image of Wren-style flat-pack kitchen carcasses being assembled and installed in a British home. Fitter in dark workwear, clean workspace. ${PHOTO_STYLE}.` },
    { slug: "wren-handleless-doors", dir: "brand/wren", size: "half",
      prompt: `Photorealistic close-up of sleek handleless white kitchen cabinet doors with J-pull detail. Premium gloss finish, precise alignment. British kitchen. ${PHOTO_STYLE}.` },
    { slug: "wren-finished-result", dir: "brand/wren", size: "wide",
      prompt: `Photorealistic completed Wren-style handleless kitchen with island unit, marble-effect quartz worktop and integrated Siemens appliances. ${PHOTO_STYLE}.` },
    // Howdens
    { slug: "howdens-kitchen-overview", dir: "brand/howdens", size: "hero",
      prompt: `Photorealistic wide view of a finished Howdens Greenwich Shaker kitchen in sage green with brass handles, oak-effect worktop, integrated appliances. British home. ${PHOTO_STYLE}.` },
    { slug: "howdens-rigid-units", dir: "brand/howdens", size: "half",
      prompt: `Photorealistic image of rigid pre-assembled Howdens kitchen carcasses being installed in a British kitchen. Solid box construction visible. ${PHOTO_STYLE}.` },
    { slug: "howdens-shaker-detail", dir: "brand/howdens", size: "half",
      prompt: `Photorealistic close-up of a sage green Howdens shaker cabinet door with brushed brass cup handle. Premium painted finish, British kitchen. ${PHOTO_STYLE}.` },
    { slug: "howdens-finished-result", dir: "brand/howdens", size: "wide",
      prompt: `Photorealistic completed Howdens shaker kitchen — sage green painted doors, stone worktop, breakfast bar, integrated appliances, natural daylight. ${PHOTO_STYLE}.` },
    // IKEA
    { slug: "ikea-kitchen-overview", dir: "brand/ikea", size: "hero",
      prompt: `Photorealistic wide view of a completed IKEA METOD kitchen with VOXTORP matt white doors, quartz worktop, British Victorian terrace context. ${PHOTO_STYLE}.` },
    { slug: "ikea-flatpack-assembly", dir: "brand/ikea", size: "wide",
      prompt: `Photorealistic image of IKEA METOD kitchen flat-pack carcasses being assembled on site in a British home. Parts laid out systematically, installation in progress. ${PHOTO_STYLE}.` },
    { slug: "ikea-door-detail", dir: "brand/ikea", size: "half",
      prompt: `Photorealistic close-up of IKEA METOD cabinet with Voxtorp or Axstad style door fitted. Clean Scandinavian design, British kitchen setting. ${PHOTO_STYLE}.` },
    { slug: "ikea-finished-result", dir: "brand/ikea", size: "wide",
      prompt: `Photorealistic completed IKEA kitchen with clean Scandinavian minimal design, matt white doors, wood-effect worktop, integrated appliances. British home. ${PHOTO_STYLE}.` },
    // Magnet
    { slug: "magnet-kitchen-overview", dir: "brand/magnet", size: "hero",
      prompt: `Photorealistic wide view of a finished Magnet Belgravia painted shaker kitchen in navy blue with quartz worktop and brass hardware. British home. ${PHOTO_STYLE}.` },
    { slug: "magnet-installation", dir: "brand/magnet", size: "wide",
      prompt: `Photorealistic image of Magnet kitchen rigid units being installed in a British home. Quality cabinetry installation in progress. ${PHOTO_STYLE}.` },
    { slug: "magnet-door-detail", dir: "brand/magnet", size: "half",
      prompt: `Photorealistic close-up of a Magnet painted in-frame style kitchen door in dark navy with brushed brass handle. Premium British kitchen. ${PHOTO_STYLE}.` },
    { slug: "magnet-finished-result", dir: "brand/magnet", size: "wide",
      prompt: `Photorealistic completed Magnet navy painted shaker kitchen with island, quartz worktop, range cooker, natural daylight. ${PHOTO_STYLE}.` },
  ],

  // ── STYLES ───────────────────────────────────────────────────────────────────
  styles: [
    // Shaker
    { slug: "shaker-overview", dir: "styles/shaker", size: "hero",
      prompt: `Photorealistic wide view of a classic cream shaker kitchen in a real British home. Recessed panel doors, brushed chrome cup handles, wood worktop, natural daylight. ${PHOTO_STYLE}.` },
    { slug: "shaker-door-detail", dir: "styles/shaker", size: "half",
      prompt: `Photorealistic close-up of white painted shaker kitchen door with recessed centre panel and brushed brass handle. Classic British kitchen. ${PHOTO_STYLE}.` },
    { slug: "shaker-installation", dir: "styles/shaker", size: "wide",
      prompt: `Photorealistic image of shaker kitchen cabinet units being professionally fitted in a British home. Installation in progress, natural daylight. ${PHOTO_STYLE}.` },
    { slug: "shaker-finished-result", dir: "styles/shaker", size: "wide",
      prompt: `Photorealistic completed sage green shaker kitchen — painted doors, quartz worktop, brass fixtures, Belfast sink, real British home. ${PHOTO_STYLE}.` },
    { slug: "shaker-in-period-home", dir: "styles/shaker", size: "half",
      prompt: `Photorealistic shaker kitchen in a Victorian British terrace house. Traditional proportions, cream doors, butler's sink, exposed brick or original features visible. ${PHOTO_STYLE}.` },
    // Handleless
    { slug: "handleless-overview", dir: "styles/handleless", size: "hero",
      prompt: `Photorealistic wide view of a sleek charcoal handleless kitchen in a modern British home extension. J-pull profile, quartz worktop, integrated appliances. ${PHOTO_STYLE}.` },
    { slug: "handleless-door-detail", dir: "styles/handleless", size: "half",
      prompt: `Photorealistic close-up of dark grey handleless kitchen cabinet doors with J-pull profile. Premium matt finish, precise alignment. ${PHOTO_STYLE}.` },
    { slug: "handleless-installation", dir: "styles/handleless", size: "wide",
      prompt: `Photorealistic image of handleless kitchen cabinets being installed. Precision fitting of J-pull door profile, professional installation. ${PHOTO_STYLE}.` },
    { slug: "handleless-finished-result", dir: "styles/handleless", size: "wide",
      prompt: `Photorealistic completed dark charcoal handleless kitchen with waterfall island, Dekton worktop, integrated appliances, British open-plan home. ${PHOTO_STYLE}.` },
    // German
    { slug: "german-overview", dir: "styles/german", size: "hero",
      prompt: `Photorealistic wide view of a premium German precision kitchen — Häcker or Nobilia style, handleless, high-gloss lacquer, stone worktop, integrated appliances. ${PHOTO_STYLE}.` },
    { slug: "german-engineering-detail", dir: "styles/german", size: "half",
      prompt: `Photorealistic close-up of premium German kitchen cabinet hinge and hardware — Blum soft-close mechanism, precise engineering, immaculate fit. ${PHOTO_STYLE}.` },
    { slug: "german-finished-result", dir: "styles/german", size: "wide",
      prompt: `Photorealistic completed premium German handleless kitchen — high gloss lacquer, stone worktop, seamless integration, Miele appliances. ${PHOTO_STYLE}.` },
    // In-frame
    { slug: "in-frame-overview", dir: "styles/in-frame", size: "hero",
      prompt: `Photorealistic wide view of a traditional British in-frame painted kitchen — sage green, face frame construction, in-frame doors, Shaker style, flagstone floor. ${PHOTO_STYLE}.` },
    { slug: "in-frame-construction-detail", dir: "styles/in-frame", size: "half",
      prompt: `Photorealistic close-up of an in-frame kitchen door set within a solid timber face-frame. Traditional British craftsmanship, painted finish. ${PHOTO_STYLE}.` },
    { slug: "in-frame-finished-result", dir: "styles/in-frame", size: "wide",
      prompt: `Photorealistic completed in-frame painted kitchen in a large British farmhouse or period property. Traditional proportions, painted in-frame doors, stone worktop. ${PHOTO_STYLE}.` },
    // Painted
    { slug: "painted-overview", dir: "styles/painted", size: "hero",
      prompt: `Photorealistic wide view of a hand-painted kitchen in deep navy blue with brass handles and marble quartz worktop in a real British home. ${PHOTO_STYLE}.` },
    { slug: "painted-door-detail", dir: "styles/painted", size: "half",
      prompt: `Photorealistic close-up of hand-painted kitchen cabinet door in deep sage green. Smooth eggshell paint finish, brass knob handle. ${PHOTO_STYLE}.` },
    { slug: "painted-finished-result", dir: "styles/painted", size: "wide",
      prompt: `Photorealistic completed two-tone painted kitchen — navy lower units, cream upper units, marble worktop, brass fixtures, British family home. ${PHOTO_STYLE}.` },
    // Luxury
    { slug: "luxury-overview", dir: "styles/luxury", size: "hero",
      prompt: `Photorealistic wide view of a high-end luxury British kitchen — Neptune or Tom Howley style, hand-painted in-frame doors, marble or Dekton worktop, designer fixtures. ${PHOTO_STYLE}.` },
    { slug: "luxury-detail", dir: "styles/luxury", size: "half",
      prompt: `Photorealistic close-up of luxury kitchen bespoke cabinetry details — fluted pilaster, hand-painted finish, premium brass hardware, marble worktop edge. ${PHOTO_STYLE}.` },
    { slug: "luxury-finished-result", dir: "styles/luxury", size: "wide",
      prompt: `Photorealistic completed luxury kitchen in a large British home — bespoke painted cabinetry, marble island, premium appliances, professional photography. ${PHOTO_STYLE}.` },
  ],

  // ── REPAIRS ───────────────────────────────────────────────────────────────────
  repairs: [
    // Door replacement
    { slug: "door-before", dir: "repairs/door-replacement", size: "half",
      prompt: `Photorealistic image of a warped or damaged kitchen cabinet door hanging misaligned on its hinges in a real British kitchen. The problem is clearly visible. ${PHOTO_STYLE}.` },
    { slug: "door-during", dir: "repairs/door-replacement", size: "half",
      prompt: `Photorealistic image of a new kitchen door being hung and adjusted by a professional fitter. Hinge alignment, door fitting process. ${PHOTO_STYLE}.` },
    { slug: "door-after", dir: "repairs/door-replacement", size: "half",
      prompt: `Photorealistic image of a beautifully aligned set of new kitchen cabinet doors — perfectly hung, even gaps, professional finish. ${PHOTO_STYLE}.` },
    // Hinge replacement
    { slug: "hinge-close-up", dir: "repairs/hinge-upgrade", size: "half",
      prompt: `Photorealistic close-up of a Blum kitchen cabinet hinge being adjusted with a screwdriver. Three-way adjustment, professional repair context. ${PHOTO_STYLE}.` },
    { slug: "softclose-hinge", dir: "repairs/hinge-upgrade", size: "half",
      prompt: `Photorealistic close-up of a modern Blum soft-close concealed hinge on a kitchen cabinet door. Premium hardware, precise engineering detail. ${PHOTO_STYLE}.` },
    // Drawer repair
    { slug: "drawer-before", dir: "repairs/drawer-repair", size: "half",
      prompt: `Photorealistic image of a sticking or misaligned kitchen drawer that won't close properly in a real British kitchen. Problem clearly visible. ${PHOTO_STYLE}.` },
    { slug: "drawer-runner-fitting", dir: "repairs/drawer-repair", size: "half",
      prompt: `Photorealistic close-up of a Blum Tandem drawer runner being installed inside a kitchen cabinet. Professional drawer repair in progress. ${PHOTO_STYLE}.` },
    { slug: "drawer-after", dir: "repairs/drawer-repair", size: "half",
      prompt: `Photorealistic image of kitchen drawers opening smoothly and fully with soft-close mechanism. Perfect alignment, professional finish. ${PHOTO_STYLE}.` },
    // Worktop
    { slug: "worktop-joint-repair", dir: "repairs/worktop-work", size: "half",
      prompt: `Photorealistic close-up of a kitchen worktop joint being repaired — router cutting a new precision joint. Professional worktop repair in progress. ${PHOTO_STYLE}.` },
    { slug: "worktop-after", dir: "repairs/worktop-work", size: "half",
      prompt: `Photorealistic close-up of a perfectly sealed and flush kitchen worktop joint after professional repair. No gaps, watertight finish. ${PHOTO_STYLE}.` },
    // Plinth/cornice
    { slug: "plinth-fitting", dir: "repairs/plinth-pelmet", size: "half",
      prompt: `Photorealistic image of kitchen plinth panels being fitted at floor level — plinth clips engaged, clean professional finish at floor junction. ${PHOTO_STYLE}.` },
    { slug: "cornice-fitting", dir: "repairs/plinth-pelmet", size: "half",
      prompt: `Photorealistic image of kitchen cornice moulding being mitred and fitted to wall unit tops. Precision cutting, professional finish. ${PHOTO_STYLE}.` },
    // Snagging
    { slug: "snagging-before", dir: "repairs/adjustment-snag", size: "half",
      prompt: `Photorealistic image of kitchen doors in poor alignment — uneven gaps, misaligned handles, doors not closing flush. The snagging problem before repair. ${PHOTO_STYLE}.` },
    { slug: "snagging-after", dir: "repairs/adjustment-snag", size: "half",
      prompt: `Photorealistic image of kitchen doors in perfect alignment after professional snagging — even gaps, flush close, perfect reveal across entire kitchen run. ${PHOTO_STYLE}.` },
    // End panel
    { slug: "end-panel", dir: "repairs/end-panel", size: "half",
      prompt: `Photorealistic image of a kitchen end panel being scribed to an uneven wall and fitted. Scribing jig, professional fitting of exposed cabinet side. ${PHOTO_STYLE}.` },
    // Appliance door
    { slug: "appliance-door-repair", dir: "repairs/appliance-door", size: "half",
      prompt: `Photorealistic image of an integrated dishwasher furniture panel door being refitted and realigned. Door slider mechanism, professional appliance door repair. ${PHOTO_STYLE}.` },
  ],

  // ── APPLIANCES ────────────────────────────────────────────────────────────────
  appliances: [
    { slug: "dishwasher-installation", dir: "appliances/dishwasher", size: "half",
      prompt: `Photorealistic image of an integrated dishwasher being installed into kitchen cabinetry housing. Fitter setting the appliance level, connecting supply lines. ${PHOTO_STYLE}.` },
    { slug: "dishwasher-door-panel", dir: "appliances/dishwasher", size: "half",
      prompt: `Photorealistic close-up of an integrated dishwasher with matching door panel fitted flush with adjacent cabinet doors. Perfect alignment. ${PHOTO_STYLE}.` },
    { slug: "fridge-installation", dir: "appliances/fridge", size: "half",
      prompt: `Photorealistic image of an integrated fridge being slid into kitchen housing unit. Fitter positioning the appliance, British kitchen setting. ${PHOTO_STYLE}.` },
    { slug: "fridge-panel-fitted", dir: "appliances/fridge", size: "half",
      prompt: `Photorealistic close-up of an integrated fridge with tall decor door panel fitted, matching surrounding kitchen cabinets perfectly. ${PHOTO_STYLE}.` },
    { slug: "washing-machine-installation", dir: "appliances/washing-machine", size: "half",
      prompt: `Photorealistic image of an integrated washing machine being installed under kitchen worktop in a British home. Connecting hoses, positioning in housing. ${PHOTO_STYLE}.` },
    { slug: "oven-installation", dir: "appliances/oven", size: "half",
      prompt: `Photorealistic image of an integrated oven being installed into a tall kitchen housing unit. Fitter setting the appliance, connecting power. ${PHOTO_STYLE}.` },
    { slug: "appliances-overview", dir: "appliances", size: "wide",
      prompt: `Photorealistic wide view of a complete British kitchen with all integrated appliances fitted — dishwasher, fridge freezer, oven, all with matching door panels flush with cabinets. ${PHOTO_STYLE}.` },
  ],

  // ── SERVICES ──────────────────────────────────────────────────────────────────
  services: [
    { slug: "cabinet-installation-overview", dir: "services/cabinet-installation", size: "hero",
      prompt: `Photorealistic wide view of kitchen base and wall units being professionally installed and levelled in a British home. All carcasses in position. ${PHOTO_STYLE}.` },
    { slug: "cabinet-levelling", dir: "services/cabinet-installation", size: "half",
      prompt: `Photorealistic image of kitchen base unit being precisely levelled using adjustable feet and spirit level. Foundation of professional installation. ${PHOTO_STYLE}.` },
    { slug: "worktop-cutting", dir: "services/worktop-fitting", size: "hero",
      prompt: `Photorealistic wide view of kitchen worktop being professionally measured, marked and cut to length. Professional fitter, clean workspace. ${PHOTO_STYLE}.` },
    { slug: "worktop-joint", dir: "services/worktop-fitting", size: "half",
      prompt: `Photorealistic close-up of a precision router worktop joint — two sections of laminate worktop joined seamlessly at corner. ${PHOTO_STYLE}.` },
    { slug: "appliance-svc-overview", dir: "services/appliance-installation", size: "hero",
      prompt: `Photorealistic wide view of integrated kitchen appliances being professionally fitted — dishwasher, oven and fridge all being integrated in sequence. ${PHOTO_STYLE}.` },
    { slug: "door-fitting-overview", dir: "services/door-fitting", size: "hero",
      prompt: `Photorealistic wide view of a complete set of kitchen doors being hung, adjusted and aligned by a professional fitter. Perfect reveal across entire kitchen. ${PHOTO_STYLE}.` },
    { slug: "trims-plinth-overview", dir: "services/trims-and-plinths", size: "hero",
      prompt: `Photorealistic wide view showing kitchen plinth, cornice and pelmet all being fitted to complete the kitchen — professional finishing details. ${PHOTO_STYLE}.` },
    { slug: "handles-fitting", dir: "services/handles-and-ironmongery", size: "hero",
      prompt: `Photorealistic wide view of a kitchen with handles being systematically fitted using a template — precise positioning, all handles perfectly aligned. ${PHOTO_STYLE}.` },
    { slug: "snagging-overview", dir: "services/snagging", size: "hero",
      prompt: `Photorealistic wide view of a professional kitchen fitter doing a methodical snagging inspection of a completed British kitchen. Checking every door, drawer and trim. ${PHOTO_STYLE}.` },
    { slug: "flooring-tiling-overview", dir: "services/flooring-tiling", size: "hero",
      prompt: `Photorealistic wide view of kitchen floor tiles being professionally laid in a British home. Tile spacers, adhesive, perfectly level floor. ${PHOTO_STYLE}.` },
    { slug: "wall-tiles-splashback", dir: "services/flooring-tiling", size: "half",
      prompt: `Photorealistic image of white metro tiles being fitted as a kitchen splashback behind a hob. Professional tiling in progress. ${PHOTO_STYLE}.` },
  ],

  // ── PROPERTY types ────────────────────────────────────────────────────────────
  property: [
    { slug: "victorian-terrace-kitchen", dir: "property", size: "half",
      prompt: `Photorealistic image of a kitchen installed in a Victorian terraced house in the UK — period features visible (cornicing, sash windows), modern fitted kitchen within. ${PHOTO_STYLE}.` },
    { slug: "semi-detached-kitchen", dir: "property", size: "half",
      prompt: `Photorealistic image of a fitted kitchen in a typical British semi-detached home. 1960s or 1970s property, modern kitchen installed. ${PHOTO_STYLE}.` },
    { slug: "new-build-kitchen", dir: "property", size: "half",
      prompt: `Photorealistic image of a fitted kitchen in a modern British new-build home. Clean modern property, bright natural light, handleless kitchen. ${PHOTO_STYLE}.` },
    { slug: "detached-house-kitchen", dir: "property", size: "wide",
      prompt: `Photorealistic wide view of a large kitchen in a British detached house. Open plan kitchen-diner, island unit, bifold doors to garden. ${PHOTO_STYLE}.` },
    { slug: "period-property-kitchen", dir: "property", size: "half",
      prompt: `Photorealistic image of a kitchen in a British period property — Edwardian or Georgian house, high ceilings, bay window, traditional painted kitchen. ${PHOTO_STYLE}.` },
    { slug: "berkshire-executive-kitchen", dir: "property", size: "wide",
      prompt: `Photorealistic wide view of a premium kitchen in an executive Berkshire home. High specification German or luxury kitchen, professional photography. ${PHOTO_STYLE}.` },
    { slug: "cottage-kitchen", dir: "property", size: "half",
      prompt: `Photorealistic image of a kitchen in a British cottage or rural property — low ceiling, exposed beams, traditional painted kitchen, flagstone floor. ${PHOTO_STYLE}.` },
    { slug: "apartment-kitchen", dir: "property", size: "half",
      prompt: `Photorealistic image of a fitted kitchen in a British city centre apartment. Compact efficient layout, modern handleless units, integrated appliances. ${PHOTO_STYLE}.` },
  ],

};

// ── fal.ai call ───────────────────────────────────────────────────────────────
async function callFal(ratio, count, prompt) {
  const res = await fetch(FAL_URL, {
    method: "POST",
    headers: { "Authorization": `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspect_ratio: ratio, resolution: "4K", num_images: count, output_format: "png" }),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`fal ${res.status}: ${t}`); }
  const data = await res.json();
  const images = data?.images;
  if (!Array.isArray(images) || images.length === 0) throw new Error("no images");

  return await Promise.all(images.map(async (img, i) => {
    const dlRes = await fetch(img.url);
    if (!dlRes.ok) throw new Error(`download[${i}] failed`);
    const buf = Buffer.from(await dlRes.arrayBuffer());
    const meta = await sharp(buf).metadata();
    const short = Math.min(meta.width, meta.height);
    if (short < 1800) throw new Error(`grid[${i}] too small: ${short}px`);
    return { buf, width: meta.width, height: meta.height };
  }));
}

// ── Crop top-left quadrant ────────────────────────────────────────────────────
async function cropQuadrant(buf, gridW, gridH, sizeCfg) {
  const qW = Math.floor(gridW / 2);
  const qH = Math.floor(gridH / 2);
  if (Math.min(qW, qH) < sizeCfg.quadrantFloor) throw new Error(`quadrant too small`);
  return sharp(buf).extract({ left: 0, top: 0, width: qW, height: qH }).toBuffer();
}

// ── Save WebP ─────────────────────────────────────────────────────────────────
async function saveWebP(buf, cfg, outPath) {
  mkdirSync(outPath.split("/").slice(0,-1).join("/"), { recursive: true });
  await sharp(buf).resize(cfg.w, cfg.h, { fit: "cover", position: "centre" }).webp({ quality: 82 }).toFile(outPath);
  console.log(`  → ${outPath} (${cfg.w}×${cfg.h})`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const batchesToRun = BATCH_ARG === "all"
  ? Object.keys(BATCHES)
  : BATCH_ARG.split(",").filter(k => BATCHES[k]);

console.log(`\n${"═".repeat(60)}`);
console.log(` IMK Comprehensive Image Generation`);
console.log(` Batches: ${batchesToRun.join(", ")}`);
console.log(` Mode: ${TEST_MODE ? "TEST (1 image per call)" : "FULL"}`);
console.log(`${"═".repeat(60)}\n`);

let ok = 0, skip = 0, fail = 0;

for (const batchKey of batchesToRun) {
  const images = TEST_MODE ? BATCHES[batchKey].slice(0, 2) : BATCHES[batchKey];
  console.log(`\n▶ Batch: ${batchKey} (${images.length} images)`);

  // Group by ratio for efficient API calls
  const byRatio = {};
  for (const img of images) {
    const sizeCfg = SIZES[img.size];
    if (!byRatio[sizeCfg.ratio]) byRatio[sizeCfg.ratio] = [];
    byRatio[sizeCfg.ratio].push({ ...img, sizeCfg });
  }

  for (const [ratio, items] of Object.entries(byRatio)) {
    // Chunk into MAX_PER_CALL
    for (let i = 0; i < items.length; i += MAX_PER_CALL) {
      const chunk = items.slice(i, i + MAX_PER_CALL);

      // Skip if all exist
      const allExist = chunk.every(item => {
        const out = join(ROOT, `public/assets/${item.dir}/${item.slug}.webp`);
        return existsSync(out);
      });
      if (allExist) {
        for (const item of chunk) { console.log(`  [skip] ${item.dir}/${item.slug}`); skip++; }
        continue;
      }

      // Use first non-existing item's prompt for the batch call
      const representative = chunk.find(item => !existsSync(join(ROOT, `public/assets/${item.dir}/${item.slug}.webp`)));

      let grids;
      try {
        grids = await callFal(ratio, chunk.length, representative.prompt);
        console.log(`  [fal] ${ratio} ×${chunk.length} — received ${grids.length} grids`);
      } catch (err) {
        console.error(`  [ERR] fal call failed: ${err.message}`);
        fail += chunk.length;
        continue;
      }

      for (let j = 0; j < chunk.length; j++) {
        const item = chunk[j];
        const grid = grids[j];
        const outPath = join(ROOT, `public/assets/${item.dir}/${item.slug}.webp`);

        if (existsSync(outPath)) { console.log(`  [skip] ${item.dir}/${item.slug}`); skip++; continue; }
        if (!grid) { console.warn(`  [warn] no grid for ${item.slug}`); fail++; continue; }

        try {
          const quad = await cropQuadrant(grid.buf, grid.width, grid.height, item.sizeCfg);
          await saveWebP(quad, item.sizeCfg, outPath);
          ok++;
        } catch (err) {
          console.error(`  [ERR] ${item.slug}: ${err.message}`);
          fail++;
        }
      }
    }
  }
}

console.log(`\n${"═".repeat(60)}`);
console.log(` Done: ${ok} generated, ${skip} skipped, ${fail} failed`);
console.log(`${"═".repeat(60)}\n`);
