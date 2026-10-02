import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { createClient } from "@sanity/client";
import { validateArticle } from "../lib/content.mjs";
const client = createClient({
  projectId: process.env.SANITY_API_PROJECT_ID,
  dataset: process.env.SANITY_API_DATASET,
  apiVersion: "2026-09-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
const samples = [
  [
    "translation-beyond-language",
    "perspectives",
    "One idea.",
    "Two perspectives.",
    "Across cultures",
    "London ↔ Shanghai",
    "social",
  ],
  [
    "creator-brief-local-voice",
    "brief",
    "Shared idea.",
    "Local expression.",
    "A creator brief",
    "Room for a local voice",
    "influencer",
  ],
  [
    "london-pop-up-shared-story",
    "invitation",
    "Come together.",
    "A story to share.",
    "An invitation",
    "London",
    "offline",
  ],
];
for (const [
  i,
  [slug, template, phraseA, phraseB, eyebrow, location, relatedService],
] of samples.entries()) {
  const $ = load(await readFile(`journal/${slug}/index.html`, "utf8"));
  const body = $("[data-article-body]")
    .children()
    .toArray()
    .map((node, i) => ({
      _key: `block${i}`,
      _type: "block",
      style: node.tagName === "h2" ? "h2" : "normal",
      markDefs: [],
      children: [
        { _type: "span", _key: `span${i}`, text: $(node).text(), marks: [] },
      ],
    }));
  const doc = {
    _id: `zeeman-sample-${slug}`,
    _type: "article",
    title: $("h1").text(),
    slug: { _type: "slug", current: slug },
    excerpt: $(".journal-article__standfirst").text(),
    category: $(".journal-article__introduction .journal-meta span")
      .first()
      .text(),
    sample: true,
    featured: i === 0,
    publishedAt: `2026-10-0${3 - i}T10:00:00Z`,
    relatedService,
    cover: { template, phraseA, phraseB, eyebrow, location },
    body,
  };
  const errors = validateArticle(doc);
  if (errors.length) throw new Error(errors.join("; "));
  await client.createIfNotExists(doc);
  console.log(`Sample available: ${slug}`);
}
const result = await client.fetch(
  'count(*[_type=="article" && !(_id in path("drafts.**"))])',
);
console.log(`Verified ${result} published articles in demo CMS.`);
