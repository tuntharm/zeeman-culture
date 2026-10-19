import assert from "node:assert/strict";
import { JOURNAL_ENABLED } from "../lib/features.mjs";
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:8093";
const journalRoutes = ["/journal/", "/journal/translation-beyond-language/", "/journal/creator-brief-local-voice/", "/journal/london-pop-up-shared-story/", "/studio/", "/studio/structure/", "/studio/index.html"];
for (const route of [
  "/",
  ...(JOURNAL_ENABLED ? journalRoutes : []),
  "/work/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/services/influencer-marketing/",
  "/services/social-media-management/",
  "/services/offline-activations/",
]) {
  const response = await fetch(origin + route);
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.match(html, /<html/i);
  if (!JOURNAL_ENABLED) assert.doesNotMatch(html, /href="\/(?:journal|studio)\//);
  else if (!route.startsWith("/studio/")) assert.match(html, /href="\/studio\/"/);
  console.log(`OK ${route}`);
}
for (const route of [
  ...(!JOURNAL_ENABLED ? journalRoutes : []),
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
