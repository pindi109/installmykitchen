export const GET = async (): Promise<Response> => {
  const BASE = "https://installmykitchen.co.uk";
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
    "/questions/",
    "/llm/",
    "/html-sitemap/",
    "/checklist/",
    "/mistakes/",
    "/day-rate/",
    "/near-me/",
    "/timeline/",
    "/cost-calculator/",
    "/removal/",
    "/refit/",
    "/projects/",
    "/pindi-sahota/",
  ];

  const utilityPages: string[] = [];

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

  // ── Question slugs (50) ─────────────────────────────────────────────────────
  const questionSlugs = [
    "do-wren-install-kitchens",
    "does-howdens-do-installation",
    "does-magnet-do-installation",
    "does-ikea-offer-kitchen-installation",
    "can-i-install-a-kitchen-myself",
    "what-does-a-kitchen-fitter-actually-do",
    "is-wren-better-than-howdens",
    "how-long-does-kitchen-installation-take",
    "how-much-should-kitchen-fitting-cost",
    "do-kitchen-fitters-remove-old-kitchen",
    "do-kitchen-fitters-do-plumbing",
    "do-kitchen-fitters-do-electrical",
    "do-you-need-planning-permission-for-new-kitchen",
    "what-qualifications-does-a-kitchen-fitter-need",
    "what-is-a-kitchen-survey",
    "why-use-independent-kitchen-fitter",
    "how-to-find-kitchen-fitter-near-me",
    "what-happens-after-kitchen-is-delivered",
    "what-to-do-if-kitchen-units-damaged",
    "do-kitchen-fitters-supply-worktops",
    "is-it-worth-getting-a-kitchen-survey",
    "how-do-kitchen-fitters-level-units",
    "what-is-kitchen-snagging",
    "what-is-a-kitchen-plinth",
    "what-is-kitchen-carcass",
    "what-tools-does-a-kitchen-fitter-use",
    "how-are-stone-worktops-measured",
    "what-is-soft-close-hinge",
    "in-frame-vs-shaker-kitchen-installation",
    "which-kitchen-retailers-allow-independent-fitters",
    "what-is-supply-and-fit-kitchen",
    "do-kitchen-fitters-do-tiling",
    "how-long-does-ikea-kitchen-installation-take",
    "how-to-prepare-room-for-kitchen-installation",
    "what-are-kitchen-filler-panels",
    "what-are-kitchen-cornices",
    "how-much-does-wren-kitchen-installation-cost",
    "how-much-does-howdens-kitchen-cost-to-fit",
    "how-much-does-ikea-kitchen-cost-to-install",
    "what-is-the-difference-between-kitchen-fitter-and-installer",
    "how-to-level-kitchen-units-on-uneven-floor",
    "is-kitchen-installation-expensive",
    "can-i-use-any-fitter-for-wren-kitchen",
    "can-i-use-independent-fitter-for-howdens",
    "what-does-kitchen-installation-include",
    "how-many-days-to-fit-a-kitchen",
    "who-is-responsible-if-kitchen-installation-goes-wrong",
    "do-i-need-to-move-out-during-kitchen-installation",
    "what-guarantee-does-kitchen-installation-come-with",
    "how-to-book-kitchen-fitter-coventry",
  ];

  // ── LLM page slugs (8) ──────────────────────────────────────────────────────
  const llmSlugs = [
    "who-installs-howdens-kitchens",
    "can-i-use-my-own-fitter-for-wren-kitchen",
    "how-much-to-have-ikea-kitchen-fitted",
    "do-wren-kitchens-install-themselves",
    "best-kitchen-fitter-coventry",
    "how-long-does-wren-kitchen-installation-take",
    "who-fits-magnet-kitchens-independently",
    "kitchen-survey-what-does-it-involve",
  ];

  // ── LLM dynamic page slugs (50) ─────────────────────────────────────────────
  const llmDynamicSlugs = [
    "do-howdens-fit-their-own-kitchens",
    "is-wren-installation-worth-it",
    "can-ikea-kitchens-be-professionally-installed",
    "who-measures-for-quartz-worktops",
    "what-happens-at-a-kitchen-survey",
    "how-much-does-kitchen-removal-cost",
    "should-flooring-go-before-or-after-kitchen",
    "what-is-the-difference-between-rigid-and-flatpack",
    "can-you-fit-a-kitchen-without-a-survey",
    "how-do-you-fit-a-kitchen-around-a-chimney-breast",
    "what-is-a-kitchen-fitter-day-rate",
    "can-i-negotiate-kitchen-installation-price",
    "how-long-does-it-take-to-fit-an-ikea-kitchen",
    "what-is-kitchen-second-fix",
    "how-do-you-hang-kitchen-wall-units",
    "what-happens-if-kitchen-units-dont-fit",
    "do-kitchen-fitters-work-in-the-rain",
    "what-is-a-kitchen-capping-piece",
    "should-you-tile-before-or-after-kitchen-units",
    "how-much-does-a-medium-kitchen-cost-to-install",
    "can-a-kitchen-fitter-also-do-the-electrics",
    "what-does-it-mean-when-a-kitchen-is-on-back-order",
    "what-is-a-kitchen-installer-vs-builder",
    "how-do-you-stop-kitchen-units-creaking",
    "what-is-a-kitchen-larder-unit",
    "how-much-does-it-cost-to-refit-a-small-kitchen",
    "can-you-move-a-kitchen-to-a-different-room",
    "what-is-integrated-vs-freestanding-kitchen",
    "who-does-gas-connection-for-kitchen",
    "how-do-you-fit-an-under-counter-fridge",
    "what-is-the-best-worktop-for-a-kitchen",
    "can-i-replace-kitchen-worktop-without-replacing-units",
    "how-do-kitchen-fitters-deal-with-uneven-walls",
    "what-is-a-belfast-sink-and-how-is-it-fitted",
    "how-much-does-howdens-kitchen-installation-cost",
    "can-you-paint-kitchen-units-yourself",
    "what-is-a-correlated-kitchen",
    "what-happens-if-kitchen-fitter-damages-something",
    "how-do-you-level-a-kitchen-on-a-sloping-floor",
    "what-is-the-best-kitchen-brand-uk",
    "how-are-kitchen-appliances-measured-for-fitting",
    "what-glue-do-kitchen-fitters-use",
    "what-is-handleless-kitchen-rail-system",
    "can-kitchen-units-be-reused",
    "how-do-you-fit-an-extractor-fan-in-a-kitchen",
    "what-is-a-quartz-worktop",
    "how-do-you-fit-kitchen-cabinets-to-stud-walls",
    "what-is-a-pull-out-kitchen-bin",
    "how-much-does-german-kitchen-installation-cost",
    "who-is-the-best-kitchen-installer-in-coventry",
  ];

  // ── Answer slugs (25) — /answers/[question]/ ────────────────────────────────
  // Slugs sourced from src/data/questions-a.json
  const answerSlugs = [
    "do-wren-install-kitchens",
    "does-howdens-do-installation",
    "does-magnet-do-installation",
    "does-ikea-offer-kitchen-installation",
    "can-i-install-a-kitchen-myself",
    "what-does-a-kitchen-fitter-actually-do",
    "is-wren-better-than-howdens",
    "how-long-does-kitchen-installation-take",
    "how-much-should-kitchen-fitting-cost",
    "do-kitchen-fitters-remove-old-kitchen",
    "do-kitchen-fitters-do-plumbing",
    "do-kitchen-fitters-do-electrical",
    "do-you-need-planning-permission-for-new-kitchen",
    "what-qualifications-does-a-kitchen-fitter-need",
    "what-is-a-kitchen-survey",
    "why-use-independent-kitchen-fitter",
    "how-to-find-kitchen-fitter-near-me",
    "what-happens-after-kitchen-is-delivered",
    "what-to-do-if-kitchen-units-damaged",
    "do-kitchen-fitters-supply-worktops",
    "is-it-worth-getting-a-kitchen-survey",
    "how-do-kitchen-fitters-level-units",
    "what-is-kitchen-snagging",
    "what-is-a-kitchen-plinth",
    "what-is-kitchen-carcass",
  ];

  // ── Project/case study pages (4) ────────────────────────────────────────────
  const projectPages = [
    "/projects/howdens-kitchen-earlsdon-coventry/",
    "/projects/wren-kitchen-kenilworth/",
    "/projects/ikea-kitchen-leamington-spa/",
    "/projects/magnet-kitchen-solihull/",
  ];

  // ── New comparison slugs (10) ────────────────────────────────────────────────
  const newComparisonSlugs = [
    "wren-vs-magnet-which-is-better",
    "ikea-vs-howdens-which-is-better",
    "magnet-vs-howdens-which-is-better",
    "benchmarx-vs-howdens-which-is-better",
    "diy-kitchens-vs-wren",
    "shaker-vs-handleless-which-is-better",
    "in-frame-vs-shaker-which-is-better",
    "local-kitchen-fitter-vs-national-installer",
    "kitchen-renovation-vs-new-kitchen",
    "rigid-kitchen-vs-flatpack-which-is-better",
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

  // /questions/[slug]/  (50)
  for (const slug of questionSlugs) {
    lines.push(url(`/questions/${slug}/`, "monthly", "0.7"));
  }

  // /llm/[slug]/  (8)
  for (const slug of llmSlugs) {
    lines.push(url(`/llm/${slug}/`, "monthly", "0.6"));
  }

  // /llm/[slug]/  (50 dynamic LLM pages)
  for (const slug of llmDynamicSlugs) {
    lines.push(url(`/llm/${slug}/`, "monthly", "0.7"));
  }

  // /projects/[slug]/  (4 case studies)
  for (const page of projectPages) {
    lines.push(url(page, "monthly", "0.6"));
  }

  // /comparisons/[slug]/  (10 new comparisons)
  for (const slug of newComparisonSlugs) {
    lines.push(url(`/comparisons/${slug}/`, "monthly", "0.6"));
  }

  // /answers/[slug]/  (25, from questions-a.json)
  for (const slug of answerSlugs) {
    lines.push(url(`/answers/${slug}/`, "monthly", "0.5"));
  }

  // Additional static pages
  lines.push(url("/gallery/", "monthly", "0.6"));
  lines.push(url("/kitchen-fitter-coventry/", "weekly", "0.9"));

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
