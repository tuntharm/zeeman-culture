import { createClient } from "@sanity/client";
import { createReadStream } from "node:fs";
const client = createClient({
  projectId: process.env.SANITY_API_PROJECT_ID,
  dataset: process.env.SANITY_API_DATASET,
  apiVersion: "2026-09-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
const id = "drafts.zeeman-photo-template-demo";
if (await client.getDocument(id)) {
  console.log("Photo template draft already exists; left unchanged.");
  process.exit(0);
}
const assets = [];
for (const filename of [
  "assets/images/offline/fluid-exhibition.webp",
  "assets/images/offline/fluid-objects.webp",
])
  assets.push(
    await client.assets.upload("image", createReadStream(filename), {
      filename: filename.split("/").pop(),
    }),
  );
const picture = (index, key, alt) => ({
  _type: "image",
  _key: key,
  asset: { _type: "reference", _ref: assets[index]._id },
  alt,
  caption:
    "Image layout demonstration using photography from Zeeman’s existing website.",
  width: "reading",
});
const block = (key, text, style = "normal") => ({
  _key: key,
  _type: "block",
  style,
  markDefs: [],
  children: [{ _key: `${key}text`, _type: "span", text, marks: [] }],
});
await client.createIfNotExists({
  _id: id,
  _type: "article",
  title: "A space to gather, a story to share",
  slug: { _type: "slug", current: "a-space-to-gather" },
  excerpt:
    "An editable example: change the cover wording, try a photograph, then build the story with text and images.",
  category: "Studio notes",
  sample: true,
  featured: false,
  publishedAt: new Date().toISOString(),
  relatedService: "offline",
  cover: {
    template: "invitation",
    phraseA: "Come together.",
    phraseB: "A story to share.",
    eyebrow: "An invitation",
    location: "London",
    photo: picture(
      0,
      "cover",
      "Visitors exploring a colourful exhibition space",
    ),
  },
  body: [
    block(
      "intro",
      "This is your practice article. It stays a draft until you choose Publish. Replace these words with your own story and use the Preview tab to see how it will look.",
    ),
    block("heading", "A photograph within the story", "h2"),
    picture(0, "image1", "Visitors exploring a colourful exhibition space"),
    block(
      "paragraph",
      "A photograph can show a detail that words cannot. Add a short caption to explain why it matters, and include a photo credit when appropriate. You can move this image block above or below your paragraphs.",
    ),
    block("pairheading", "Two details, side by side", "h2"),
    {
      _type: "imagePair",
      _key: "pair",
      images: [
        picture(0, "left", "Visitors at an exhibition"),
        picture(1, "right", "Colourful sculptural objects on display"),
      ],
    },
    block(
      "ending",
      "Try switching the cover between the three designs. Your wording stays in place, while the composition changes around it. When the article feels ready, check its web address and related service under Publishing.",
    ),
  ],
});
console.log(
  "Saved a private practice draft with cover photo, body photograph and image pair.",
);
