import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { renderPage } from "../lib/site.mjs";
import { renderCover } from "../lib/cover.mjs";
const templates = {
  home: await readFile("index.html", "utf8"),
  journal: await readFile("journal/index.html", "utf8"),
  article: await readFile(
    "journal/translation-beyond-language/index.html",
    "utf8",
  ),
};
const doc = {
  _id: "article1",
  title: "A new story",
  slug: { current: "new-story" },
  excerpt: "A new introduction.",
  category: "Studio notes",
  cover: { template: "invitation", phraseA: "Gather", phraseB: "Share" },
  body: [
    {
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "A meaningful article written for this test.",
          marks: [],
        },
      ],
    },
  ],
  sample: true,
};
test("one published record connects homepage, Journal and direct article without changing templates", () => {
  for (const path of ["/", "/journal/", "/journal/new-story/"]) {
    const page = renderPage(path, [doc], templates);
    assert.equal(page.status, 200);
    assert.match(page.html, /A new story/);
    assert.match(page.html, /href="\/studio\/"/);
  }
  const $ = load(renderPage("/journal/new-story/", [doc], templates).html);
  assert.equal($("h1").text(), doc.title);
  assert.match($("[data-article-body]").text(), /meaningful article/);
  assert.equal($('meta[name="robots"]').attr("content"), "noindex,follow");
});
test("unpublished drafts do not appear in any public route", () => {
  const draft = { ...doc, _id: "drafts.article1" };
  assert.equal(
    renderPage("/journal/new-story/", [draft], templates).status,
    404,
  );
  assert.doesNotMatch(
    renderPage("/journal/", [draft], templates).html,
    /A new story/,
  );
});
test("empty Journal retains the homepage geometry anchor without old sample cards", () => {
  const $ = load(renderPage("/", [], templates).html);
  assert.equal($("#journal").length, 1);
  assert.equal($("[data-journal-rail]").children().length, 0);
  assert.match($("#journal").text(), /New stories/);
});
test("covers escape editorial text and reject executable photo URLs", () => {
  const svg = renderCover(
    {
      template: "invitation",
      phraseA: "<script>alert(1)</script>",
      phraseB: '" onclick="run()',
    },
    { photoUrl: "javascript:alert(1)", idPrefix: "test" },
  );
  assert.doesNotMatch(svg, /<script|href="javascript:/);
  assert.match(svg, /&lt;script&gt;/);
});

test("custom cover replaces the full artwork in homepage, Journal and article views", () => {
  const customDoc = {
    ...doc,
    cover: {
      template: "custom",
      phraseA: "Unused template wording",
      customImage: {
        _type: "image",
        asset: { _type: "reference", _ref: "image-custom123-1600x1200-png" },
        alt: "Our own <cover> design",
      },
    },
  };
  for (const path of ["/", "/journal/", "/journal/new-story/"]) {
    const page = renderPage(path, [customDoc], templates, {
      projectId: "abc123xy",
      dataset: "production",
    });
    assert.equal(page.status, 200);
    const $ = load(page.html);
    const image = $("svg image").first();
    assert.match(image.attr("href") || "", /custom123-1600x1200.png/);
    assert.equal(image.attr("width"), "1200");
    assert.equal(image.attr("height"), "900");
    assert.doesNotMatch(page.html, /Unused template wording/);
    assert.match(page.html, /Our own &lt;cover&gt; design/);
  }
});
