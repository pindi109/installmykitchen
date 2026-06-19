export const GET = async (): Promise<Response> => {
  const BASE = "https://www.installmykitchen.co.uk";
  const LASTMOD = "2026-06-19";

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
    "/guides/",
    "/answers/",
    "/comparisons/",
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

  // ── Installer location slugs (15) ───────────────────────────────────────────
  const installerLocations = [
    "coventry", "canley", "tile-hill", "earlsdon", "allesley",
    "rugby", "nuneaton", "bedworth", "leamington-spa", "kenilworth",
    "warwick", "solihull", "stratford-upon-avon", "southam", "hinckley",
  ];

  // ── Style-location slugs (10) ────────────────────────────────────────────────
  const styleLocations = [
    "coventry", "earlsdon", "kenilworth", "leamington-spa", "warwick",
    "rugby", "solihull", "nuneaton", "stratford-upon-avon", "hinckley",
  ];

  // ── Fitter location slugs (all 25) ──────────────────────────────────────────
  const fitterLocations = [
    "coventry", "canley", "tile-hill", "earlsdon", "allesley",
    "binley", "wyken", "walsgrave", "finham", "stivichall",
    "coundon", "radford", "rugby", "nuneaton", "bedworth",
    "hinckley", "leamington-spa", "kenilworth", "warwick", "balsall-common",
    "meriden", "solihull", "stratford-upon-avon", "southam", "atherstone",
  ];

  // ── Guide slugs (10) ────────────────────────────────────────────────────────
  const guideSlugs = [
    "how-to-prepare-for-kitchen-installation",
    "how-to-choose-a-kitchen-fitter",
    "kitchen-installation-survey-guide",
    "working-with-wren-howdens-magnet",
    "kitchen-worktop-guide",
    "kitchen-appliance-installation-guide",
    "kitchen-plumbing-electrical-guide",
    "ikea-kitchen-installation-guide",
    "kitchen-installation-timeline",
    "kitchen-snagging-guide",
  ];

  // ── Comparison slugs (10) ────────────────────────────────────────────────────
  const comparisonSlugs = [
    "wren-vs-howdens-kitchen-installation",
    "magnet-vs-wren-kitchen-installation",
    "ikea-vs-wren-kitchen-installation",
    "howdens-vs-benchmarx-kitchen-installation",
    "wickes-vs-bq-kitchen-installation",
    "independent-fitter-vs-retailer-fitter",
    "supply-only-vs-supply-and-fit",
    "fitted-kitchen-cost-comparison",
    "kitchen-fitter-vs-diy-kitchen-installation",
    "german-kitchen-installation-vs-british",
  ];

  // ── Problem slugs (10) ───────────────────────────────────────────────────────
  const problemSlugs = [
    "kitchen-units-not-level",
    "kitchen-gaps-between-units-and-wall",
    "kitchen-doors-not-aligned",
    "kitchen-worktop-joint-problems",
    "kitchen-plinth-fitting-problems",
    "kitchen-delivery-missing-parts",
    "kitchen-extractor-installation-problems",
    "kitchen-corner-unit-problems",
    "kitchen-sink-installation-problems",
    "retailer-installation-service-vs-independent",
  ];

  // ── Service slugs (8) ────────────────────────────────────────────────────────
  const serviceSlugs = [
    "cabinet-installation", "worktop-fitting", "appliance-installation",
    "door-fitting", "trims-and-plinths", "handles-and-ironmongery",
    "snagging", "flooring-tiling",
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

  // /cost/ size + extra static pages
  lines.push(url("/cost/small-kitchen-cost/", "monthly", "0.6"));
  lines.push(url("/cost/medium-kitchen-cost/", "monthly", "0.6"));
  lines.push(url("/cost/large-kitchen-cost/", "monthly", "0.6"));
  lines.push(url("/cost/labour-cost/", "monthly", "0.6"));
  lines.push(url("/cost/worktop-fitting-cost/", "monthly", "0.6"));
  lines.push(url("/cost/appliance-fitting-cost/", "monthly", "0.6"));
  lines.push(url("/cost/kitchen-survey-cost/", "monthly", "0.6"));

  // /fitter/[location]/  (25)
  for (const slug of fitterLocations) {
    lines.push(url(`/fitter/${slug}/`, "weekly", "0.7"));
  }

  // /kitchen-cost/[location]/  (25)
  for (const slug of fitterLocations) {
    lines.push(url(`/kitchen-cost/${slug}/`, "weekly", "0.7"));
  }

  // /survey/[location]/  (25)
  for (const slug of fitterLocations) {
    lines.push(url(`/survey/${slug}/`, "weekly", "0.7"));
  }

  // /areas-retailers/[area]/  (25)
  for (const slug of fitterLocations) {
    lines.push(url(`/areas-retailers/${slug}/`, "monthly", "0.6"));
  }

  // /services/[service]/  (8)
  for (const slug of serviceSlugs) {
    lines.push(url(`/services/${slug}/`, "monthly", "0.7"));
  }

  // /guides/[guide]/  (10)
  for (const slug of guideSlugs) {
    lines.push(url(`/guides/${slug}/`, "monthly", "0.6"));
  }

  // /comparisons/[comparison]/  (10)
  for (const slug of comparisonSlugs) {
    lines.push(url(`/comparisons/${slug}/`, "monthly", "0.6"));
  }

  // /problem/[problem]/  (10)
  for (const slug of problemSlugs) {
    lines.push(url(`/problem/${slug}/`, "monthly", "0.6"));
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
