export const GET = async (): Promise<Response> => {
  const BASE = "https://installmykitchen.co.uk";
  const LASTMOD = "2026-06-27";

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
    "/questions/",
    "/llm/",
    "/comparisons/",
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

  // Utility pages /privacy/ /terms/ /html-sitemap/ are intentionally noindex,
  // so they are excluded from the sitemap to avoid conflicting crawl signals.
  const utilityPages: string[] = [];

  // ── Answer detail slugs (25) ────────────────────────────────────────────────
  const answerSlugs = [
    "can-you-fit-a-howdens-kitchen",
    "can-you-fit-a-magnet-kitchen",
    "can-you-fit-a-wren-kitchen",
    "can-you-fit-an-ikea-kitchen",
    "can-you-fit-appliances",
    "do-i-need-a-plumber-for-kitchen-installation",
    "do-i-need-a-survey-before-kitchen-installation",
    "do-you-fit-worktops",
    "how-do-i-prepare-for-kitchen-installation",
    "how-long-does-kitchen-installation-take",
    "how-much-does-kitchen-installation-cost",
    "how-much-is-kitchen-labour-per-day",
    "how-to-book-kitchen-installation",
    "how-to-find-a-kitchen-fitter",
    "independent-kitchen-installer-vs-retailer-fitter",
    "kitchen-fitter-coventry",
    "kitchen-installation-coventry-cost",
    "kitchen-installation-warwickshire",
    "kitchen-installer-near-me-coventry",
    "shaker-kitchen-installation-coventry",
    "what-happens-during-kitchen-survey",
    "what-is-a-dry-fit-kitchen",
    "what-is-included-in-kitchen-installation",
    "what-is-kitchen-installation-cost-per-unit",
    "what-size-kitchen-can-you-fit",
  ];

  // ── Area slugs (33) ──────────────────────────────────────────────────────────
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
    "reading",
    "bracknell",
    "slough",
    "maidenhead",
    "windsor",
    "wokingham",
    "newbury",
    "ascot",
  ];

  // ── Retailer slugs (13) ──────────────────────────────────────────────────────
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
    "nolte",
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

  // ── Installer location slugs (all 33) ──────────────────────────────────────
  const installerLocations = [
    "coventry", "canley", "tile-hill", "earlsdon", "allesley",
    "binley", "wyken", "walsgrave", "finham", "stivichall",
    "coundon", "radford", "rugby", "nuneaton", "bedworth",
    "hinckley", "leamington-spa", "kenilworth", "warwick", "balsall-common",
    "meriden", "solihull", "stratford-upon-avon", "southam", "atherstone",
    "reading", "bracknell", "slough", "maidenhead", "windsor",
    "wokingham", "newbury", "ascot",
  ];

  // ── Style-location slugs (all 33) ───────────────────────────────────────────
  const styleLocations = [
    "coventry", "canley", "tile-hill", "earlsdon", "allesley",
    "binley", "wyken", "walsgrave", "finham", "stivichall",
    "coundon", "radford", "rugby", "nuneaton", "bedworth",
    "hinckley", "leamington-spa", "kenilworth", "warwick", "balsall-common",
    "meriden", "solihull", "stratford-upon-avon", "southam", "atherstone",
    "reading", "bracknell", "slough", "maidenhead", "windsor",
    "wokingham", "newbury", "ascot",
  ];

  // ── Fitter location slugs (all 33) ──────────────────────────────────────────
  const fitterLocations = [
    "coventry", "canley", "tile-hill", "earlsdon", "allesley",
    "binley", "wyken", "walsgrave", "finham", "stivichall",
    "coundon", "radford", "rugby", "nuneaton", "bedworth",
    "hinckley", "leamington-spa", "kenilworth", "warwick", "balsall-common",
    "meriden", "solihull", "stratford-upon-avon", "southam", "atherstone",
    "reading", "bracknell", "slough", "maidenhead", "windsor",
    "wokingham", "newbury", "ascot",
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

  // /answers/[slug]/  (25)
  for (const slug of answerSlugs) {
    lines.push(url(`/answers/${slug}/`, "monthly", "0.7"));
  }

  // /projects/[slug]/  (4 case studies)
  for (const page of projectPages) {
    lines.push(url(page, "monthly", "0.6"));
  }

  // /comparisons/[slug]/  (10 new comparisons)
  for (const slug of newComparisonSlugs) {
    lines.push(url(`/comparisons/${slug}/`, "monthly", "0.6"));
  }

  // ── /repairs/ hub ───────────────────────────────────────────────────────────
  lines.push(url("/repairs/", "weekly", "0.8"));

  // ── /repairs/[job]-[location]/  (17 × 15 = 255) ────────────────────────────
  const remedialJobSlugs = [
    "kitchen-door-replacement", "kitchen-cupboard-door-replacement",
    "integrated-appliance-door-fitting", "washing-machine-door-fitting",
    "dishwasher-door-fitting", "fridge-freezer-door-fitting",
    "kitchen-hinge-replacement", "soft-close-hinge-upgrade",
    "kitchen-drawer-repair", "kitchen-plinth-replacement",
    "kitchen-end-panel-replacement", "cornice-and-pelmet-fitting",
    "kitchen-worktop-alteration", "kitchen-worktop-joint-repair",
    "kitchen-unit-adjustment", "kitchen-snagging",
    "kitchen-finishing-after-diy-install",
  ];
  const remedialLocations = [
    "coventry", "solihull", "leamington-spa", "warwick", "kenilworth",
    "nuneaton", "rugby", "reading", "bracknell", "slough",
    "maidenhead", "windsor", "wokingham", "newbury", "ascot",
  ];
  for (const job of remedialJobSlugs) {
    for (const loc of remedialLocations) {
      lines.push(url(`/repairs/${job}-${loc}/`, "monthly", "0.6"));
    }
  }

  // ── /repairs/[brand]-[job]-[location]/  (5 × 4 × 15 = 300) ────────────────
  const repairBrandSlugs = ["wren", "howdens", "magnet", "ikea", "wickes"];
  const repairJobSlugs = [
    "kitchen-door-replacement", "kitchen-hinge-replacement",
    "kitchen-unit-adjustment", "kitchen-plinth-replacement",
  ];
  for (const brand of repairBrandSlugs) {
    for (const job of repairJobSlugs) {
      for (const loc of remedialLocations) {
        lines.push(url(`/repairs/${brand}-${job}-${loc}/`, "monthly", "0.6"));
      }
    }
  }

  // ── /appliances/[appliance]-[location]/  (5 × 15 = 75) ────────────────────
  const applianceSlugs = [
    "integrated-dishwasher-installation",
    "integrated-fridge-installation",
    "integrated-fridge-freezer-installation",
    "washing-machine-installation",
    "integrated-oven-installation",
  ];
  for (const appliance of applianceSlugs) {
    for (const loc of remedialLocations) {
      lines.push(url(`/appliances/${appliance}-${loc}/`, "monthly", "0.6"));
    }
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
