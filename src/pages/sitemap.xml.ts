export const GET = async (): Promise<Response> => {
  const BASE = "https://www.installmykitchen.co.uk";
  const LASTMOD = "2025-06-18";

  // ── Static pages ────────────────────────────────────────────────────────────
  const corePages = [
    "/",
    "/about/",
    "/services/",
    "/survey/",
    "/contact/",
    "/areas/",
    "/retailers/",
    "/premium/",
    "/costs/",
    "/answers/",
    "/html-sitemap/",
  ];

  const utilityPages = ["/privacy/", "/terms/"];

  // ── Area slugs (25) ──────────────────────────────────────────────────────────
  const areaSlugs = [
    "coventry",
    "canley",
    "tile-hill",
    "earlsdon",
    "allesley",
    "binley",
    "wyken",
    "walsgrave",
    "finham",
    "stivichall",
    "coundon",
    "radford",
    "rugby",
    "nuneaton",
    "bedworth",
    "hinckley",
    "leamington-spa",
    "kenilworth",
    "warwick",
    "balsall-common",
    "meriden",
    "solihull",
    "stratford-upon-avon",
    "southam",
    "atherstone",
  ];

  // ── Retailer slugs (12) ──────────────────────────────────────────────────────
  const retailerSlugs = [
    "wren",
    "howdens",
    "magnet",
    "magnet-trade",
    "benchmarx",
    "bq",
    "wickes",
    "ikea",
    "diy-kitchens",
    "kutchenhaus",
    "symphony",
    "masterclass",
  ];

  // ── Style slugs (10) ────────────────────────────────────────────────────────
  const styleSlugs = [
    "shaker",
    "handleless",
    "modern",
    "traditional",
    "contemporary",
    "german",
    "painted",
    "solid-wood",
    "in-frame",
    "luxury",
  ];

  // ── Installer location slugs (14) ───────────────────────────────────────────
  const installerLocations = [
    "coventry",
    "rugby",
    "nuneaton",
    "bedworth",
    "leamington-spa",
    "kenilworth",
    "warwick",
    "solihull",
    "stratford-upon-avon",
    "hinckley",
    "atherstone",
    "southam",
    "balsall-common",
    "meriden",
  ];

  // ── Style-location slugs (9) ─────────────────────────────────────────────────
  const styleLocations = [
    "coventry",
    "rugby",
    "nuneaton",
    "leamington-spa",
    "kenilworth",
    "warwick",
    "solihull",
    "bedworth",
    "hinckley",
  ];

  // ── Question slugs (25) ──────────────────────────────────────────────────────
  const questionSlugs = [
    "how-much-does-kitchen-installation-cost",
    "how-long-does-kitchen-installation-take",
    "what-is-included-in-kitchen-installation",
    "do-i-need-a-plumber-for-kitchen-installation",
    "what-is-a-dry-fit-kitchen",
    "how-to-prepare-for-kitchen-installation",
    "can-you-fit-a-wren-kitchen",
    "can-you-fit-an-ikea-kitchen",
    "can-you-fit-a-howdens-kitchen",
    "can-you-fit-a-magnet-kitchen",
    "do-you-remove-old-kitchen",
    "how-much-is-the-survey",
    "do-you-need-to-be-home-during-installation",
    "what-is-a-kitchen-fitter",
    "how-to-choose-a-kitchen-fitter",
    "what-is-rigid-vs-flat-pack-kitchen",
    "how-many-units-in-a-small-kitchen",
    "what-worktops-do-you-supply",
    "do-you-tile-after-kitchen-installation",
    "can-you-fit-a-kitchen-in-a-listed-building",
    "what-is-kitchen-snagging",
    "how-much-does-worktop-fitting-cost",
    "what-is-kitchen-kickboard",
    "how-to-level-kitchen-units",
    "what-is-a-kitchen-survey",
  ];

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const url = (path: string, freq: string, priority: string) =>
    `  <url>\n    <loc>${BASE}${path}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

  const lines: string[] = [];

  // Core static pages
  for (const page of corePages) {
    const priority = page === "/" ? "1.0" : "0.8";
    lines.push(url(page, "weekly", priority));
  }

  // Utility pages
  for (const page of utilityPages) {
    lines.push(url(page, "monthly", "0.3"));
  }

  // /areas/[slug]/
  for (const slug of areaSlugs) {
    lines.push(url(`/areas/${slug}/`, "weekly", "0.7"));
  }

  // /retailers/[slug]/
  for (const slug of retailerSlugs) {
    lines.push(url(`/retailers/${slug}/`, "weekly", "0.7"));
  }

  // /styles/[slug]/
  for (const slug of styleSlugs) {
    lines.push(url(`/styles/${slug}/`, "weekly", "0.7"));
  }

  // /installer/[retailer]-[location]/  (12 × 14 = 168)
  for (const retailer of retailerSlugs) {
    for (const location of installerLocations) {
      lines.push(url(`/installer/${retailer}-${location}/`, "monthly", "0.6"));
    }
  }

  // /styles/[style]-[location]/  (10 × 9 = 90)
  for (const style of styleSlugs) {
    for (const location of styleLocations) {
      lines.push(url(`/styles/${style}-${location}/`, "monthly", "0.6"));
    }
  }

  // /cost/[retailer]-cost/  (12)
  for (const slug of retailerSlugs) {
    lines.push(url(`/cost/${slug}-cost/`, "monthly", "0.6"));
  }

  // /cost/ size pages
  lines.push(url("/cost/small-kitchen-cost/", "monthly", "0.6"));
  lines.push(url("/cost/medium-kitchen-cost/", "monthly", "0.6"));
  lines.push(url("/cost/large-kitchen-cost/", "monthly", "0.6"));

  // /answers/[slug]/  (25)
  for (const slug of questionSlugs) {
    lines.push(url(`/answers/${slug}/`, "monthly", "0.5"));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
