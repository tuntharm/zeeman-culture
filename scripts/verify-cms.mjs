import { createClient } from "@sanity/client";
import assert from "node:assert/strict";
const projectId = process.env.SANITY_API_PROJECT_ID;
if (projectId !== "29wa60ec")
  throw new Error("This check is restricted to the Zeeman demo CMS.");
const client = createClient({
  projectId,
  dataset: process.env.SANITY_API_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: "2026-09-01",
  useCdn: false,
});
const id = `zeeman-connection-check-${Date.now()}`;
const slug = id;
const origin = "http://127.0.0.1:8093";
const doc = {
  _id: `drafts.${id}`,
  _type: "article",
  title: "Journal connection check",
  slug: { _type: "slug", current: slug },
  category: "Studio notes",
  excerpt: "Temporary automated connection check.",
  sample: true,
  featured: false,
  publishedAt: new Date().toISOString(),
  relatedService: "social",
  cover: { template: "brief", phraseA: "One idea", phraseB: "A local voice" },
  body: [
    {
      _type: "block",
      _key: "body",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: "text",
          marks: [],
          text: "This temporary article verifies the connected publishing path.",
        },
      ],
    },
  ],
};
try {
  await client.create(doc);
  assert.equal((await fetch(`${origin}/journal/${slug}/`)).status, 404);
  console.log("Draft stays private.");
  await client.create({ ...doc, _id: id });
  for (const path of ["/", "/journal/", `/journal/${slug}/`]) {
    const res = await fetch(origin + path);
    assert.equal(res.status, 200);
    assert.match(await res.text(), new RegExp(slug));
  }
  console.log("Published record appears on homepage, Journal and direct URL.");
  await client.delete(id);
  assert.equal((await fetch(`${origin}/journal/${slug}/`)).status, 404);
  console.log("Unpublished article returns 404.");
} finally {
  await client.transaction().delete(id).delete(`drafts.${id}`).commit();
  console.log("Temporary test records removed.");
}
