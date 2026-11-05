import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import templates from "../lib/generated-templates.mjs";
import { PAUSED_SECTIONS } from "../lib/features.mjs";

test("public page metadata and sitemap agree on the primary domain", async () => {
  for (const [path, html] of [
    ["/", templates.home],
    ...await Promise.all(["about", "contact", "privacy"].map(async name =>
      [`/${name}/`, await readFile(`dist/${name}/index.html`, "utf8")],
    )),
  ]) {
    const $ = load(html);
    assert.equal($('link[rel="canonical"]').attr("href"), `https://www.zeemanculture.com${path}`);
    const social = $('meta[property="og:url"]').attr("content");
    if (social) assert.equal(social, `https://www.zeemanculture.com${path}`);
  }
  const sitemap = load(await readFile("dist/sitemap.xml", "utf8"), { xmlMode: true });
  const locations = sitemap("loc").map((_, node) => sitemap(node).text()).get();
  assert.ok(locations.length >= 3);
  for (const location of locations) {
    const url = new URL(location);
    assert.equal(url.origin, "https://www.zeemanculture.com");
    assert.ok(!PAUSED_SECTIONS.some(path => url.pathname.startsWith(path)));
  }
  assert.match(await readFile("dist/robots.txt", "utf8"), /Sitemap: https:\/\/www\.zeemanculture\.com\/sitemap\.xml/);
});

test("old public hosts redirect permanently without catching the primary domain or previews", async () => {
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  const rules = config.redirects.filter(rule => rule.has?.some(condition => condition.type === "host"));
  assert.deepEqual(rules.map(rule => rule.has[0].value).sort(), [
    "zeeman-culture-tharm-s-projects.vercel.app", "zeeman-culture.vercel.app",
  ]);
  for (const rule of rules) {
    assert.equal(rule.source, "/:path*");
    assert.equal(rule.destination, "https://www.zeemanculture.com/:path*");
    assert.equal(rule.permanent, true);
  }
});
