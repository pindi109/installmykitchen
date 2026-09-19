/**
 * Manual IndexNow submission — run by hand after content changes, never wired
 * into a build hook or deploy automatically. Reads the live sitemap.xml,
 * submits every URL to the shared IndexNow endpoint (fans out to Bing,
 * Yandex, Seznam, Naver and other participating engines).
 *
 * Usage: node scripts/submit-indexnow.mjs
 * Optional: node scripts/submit-indexnow.mjs https://installmykitchen.co.uk/one-page/  (submit just one URL)
 */
const HOST = "installmykitchen.co.uk";
const KEY = "c3479390a924ebf22289d891fba6692c";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

async function getUrlsFromSitemap() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`);
  const xml = await res.text();
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1]);
}

async function submit(urlList) {
  console.log(`Submitting ${urlList.length} URL(s) to IndexNow...`);
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });
  const text = await res.text();
  console.log(`Response: ${res.status} ${res.statusText}`);
  if (text) console.log(text);
  if (!res.ok) process.exit(1);
}

const singleUrl = process.argv[2];
const urlList = singleUrl ? [singleUrl] : await getUrlsFromSitemap();
await submit(urlList);
console.log("Done.");
