import assert from "node:assert/strict";
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:8093";
for (const route of [
  "/",
  "/journal/",
  "/journal/translation-beyond-language/",
  "/journal/creator-brief-local-voice/",
  "/journal/london-pop-up-shared-story/",
  "/work/",
  "/about/",
  "/contact/",
  "/studio/",
]) {
  const response = await fetch(origin + route);
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.match(html, /<html/i);
  if (route != "/studio/") assert.match(html, /href="\/studio\/"/);
  console.log(`OK ${route}`);
}
for (const route of [
  "/.env.local",
  "/.git/config",
  "/deliverables/",
  "/lib/cms.mjs",
  "/package.json",
  "/journal/a-space-to-gather/",
  "/journal/missing/",
]) {
  const response = await fetch(origin + route);
  assert.equal(response.status, 404, route);
  console.log(`Hidden ${route}`);
}
for (const route of [
  "/journal",
  "/journal/translation-beyond-language",
  "/studio",
]) {
  const response = await fetch(origin + route, { redirect: "manual" });
  assert.equal(response.status, 308, route);
  console.log(`Canonical ${route}`);
}
