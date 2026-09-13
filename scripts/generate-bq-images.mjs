/**
 * One-off: generate the missing B&Q brand image set (installer/[brand]-[location]
 * has no brandImgMap entry for "bq", unlike wren/howdens/ikea/magnet — it silently
 * falls back to generic /assets/process/* images). Matches existing brand folder
 * conventions: overview/process/detail/finished, similar dimensions to howdens set.
 *
 * Requires FAL_KEY env var. Never prints, logs, or writes the key.
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "public/assets/brand/bq");

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("[FATAL] FAL_KEY environment variable is not set. Exiting.");
  process.exit(1);
}

const FAL_URL = "https://fal.run/fal-ai/nano-banana-pro";

const JOBS = [
  {
    file: "bq-kitchen-overview.webp",
    ratio: "16:9",
    width: 1200, height: 675,
    prompt: "A finished budget-friendly British kitchen, simple white shaker-style cabinet doors, laminate worktop, basic chrome handles, real British home, natural daylight, wide landscape framing, no people, no text, no logos, no watermarks. Photorealistic, editorial home-improvement photography, sharp focus, not stock-photo cheesy, not obviously AI.",
  },
  {
    file: "bq-installation.webp",
    ratio: "4:3",
    width: 900, height: 675,
    prompt: "A professional kitchen installer in a plain dark polo with no text, no logo and no branding on the clothing, mid-task fitting a flat-pack style kitchen base unit, screwing a cabinet into place, focused expression, natural daylight from a window, real British home. Photorealistic, sharp focus, editorial home-improvement photography, not stock-photo cheesy, not obviously AI. No text, no logos, no watermarks.",
  },
  {
    file: "bq-door-detail.webp",
    ratio: "4:3",
    width: 680, height: 510,
    prompt: "A close-up detail shot of a simple white shaker kitchen cabinet door with a basic chrome bar handle, and a laminate worktop edge visible alongside it, real British kitchen, natural light, shallow depth of field, no people, no text, no logos, no watermarks. Photorealistic, sharp focus, not stock-photo cheesy, not obviously AI.",
  },
  {
    file: "bq-finished-result.webp",
    ratio: "16:9",
    width: 1200, height: 675,
    prompt: "A different wide-angle finished view of a simple, budget-conscious British kitchen — light grey shaker-style cabinet doors, laminate worktop, integrated appliances, real British home, natural daylight, no people, no text, no logos, no watermarks. Photorealistic, editorial home-improvement photography, sharp focus, not stock-photo cheesy, not obviously AI.",
  },
];

async function generateOne(job) {
  const payload = {
    prompt: job.prompt,
    aspect_ratio: job.ratio,
    resolution: "2K",
    num_images: 1,
    output_format: "png",
  };
  console.log(`[fal] requesting ${job.file} (${job.ratio})`);
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
  const img = data?.images?.[0];
  if (!img?.url) {
    throw new Error(`fal.ai: no image in response for ${job.file}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  const dlRes = await fetch(img.url);
  if (!dlRes.ok) throw new Error(`Download failed for ${job.file}: ${dlRes.status}`);
  const buf = Buffer.from(await dlRes.arrayBuffer());

  const outPath = resolve(OUT_DIR, job.file);
  await sharp(buf)
    .resize(job.width, job.height, { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(outPath);
  console.log(`[ok] wrote ${job.file} (${job.width}x${job.height})`);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const job of JOBS) {
  await generateOne(job);
}

console.log("\nDone — B&Q brand image set generated.");
