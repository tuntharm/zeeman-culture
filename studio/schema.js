import { defineType, defineField, defineArrayMember } from "sanity";
import CoverInput from "./components/CoverInput.jsx";
import TemplateInput from "./components/TemplateInput.jsx";
import { validateArticle } from "../lib/content.mjs";
const required = (rule) => rule.required();
const isCustomCover = ({ parent }) => parent?.template === "custom";
const templateText =
  (maximum, required = false) =>
  (rule) =>
    rule.custom((value, { parent }) => {
      if (parent?.template === "custom") return true;
      if (required && !value?.trim()) return "Enter wording for this template.";
      return (
        !value ||
        [...value].length <= maximum ||
        `Use ${maximum} characters or fewer.`
      );
    });
const coverImageFields = (mode) =>
  imageFields.map((field) =>
    field.name === "alt"
      ? {
          ...field,
          validation: (rule) =>
            rule.custom((value, { document }) => {
              const active =
                mode === "custom"
                  ? document?.cover?.template === "custom"
                  : document?.cover?.template !== "custom";
              return (
                !active ||
                Boolean(value?.trim()) ||
                "Describe the cover image for people who cannot see it."
              );
            }),
        }
      : field,
  );
const imageFields = [
  defineField({
    name: "alt",
    title: "Describe the image",
    type: "string",
    description: "Help people who cannot see the image understand it.",
    validation: required,
  }),
  defineField({
    name: "caption",
    title: "Caption / photo credit",
    type: "string",
  }),
];
const picture = {
  type: "image",
  options: { hotspot: true },
  fields: imageFields,
};
export const article = defineType({
  name: "article",
  title: "Journal article",
  type: "document",
  groups: [
    { name: "story", title: "Story", default: true },
    { name: "cover", title: "Cover" },
    { name: "settings", title: "Publishing" },
  ],
  initialValue: {
    sample: false,
    category: "Cultural perspective",
    relatedService: "social",
    publishedAt: new Date().toISOString(),
    cover: {
      template: "invitation",
      eyebrow: "An invitation",
      location: "London",
    },
  },
  validation: (rule) =>
    rule.custom((doc) => {
      const errors = validateArticle(doc);
      return errors.length ? errors.join(" · ") : true;
    }),
  fields: [
    defineField({
      name: "title",
      title: "Article title",
      type: "string",
      group: "story",
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "excerpt",
      title: "Short introduction",
      description: "Appears on the Journal cards and below your title.",
      type: "text",
      rows: 3,
      group: "story",
      validation: (r) => r.required().max(240),
    }),
    defineField({
      name: "cover",
      title: "Cover artwork",
      type: "object",
      group: "cover",
      components: { input: CoverInput },
      fields: [
        defineField({
          name: "template",
          title: "Choose your cover",
          type: "string",
          initialValue: "invitation",
          components: { input: TemplateInput },
          validation: required,
        }),
        defineField({
          name: "phraseA",
          title: "First phrase",
          description: "A few words. For example: Come together.",
          type: "string",
          hidden: isCustomCover,
          validation: templateText(36, true),
        }),
        defineField({
          name: "phraseB",
          title: "Second phrase",
          description: "For example: A story to share.",
          type: "string",
          hidden: isCustomCover,
          validation: templateText(64, true),
        }),
        defineField({
          name: "eyebrow",
          title: "Small heading",
          type: "string",
          hidden: isCustomCover,
          validation: templateText(40),
        }),
        defineField({
          name: "location",
          title: "Location or small detail",
          type: "string",
          hidden: isCustomCover,
          validation: templateText(30),
        }),
        defineField({
          name: "photo",
          title: "Cover photograph (optional)",
          ...picture,
          hidden: isCustomCover,
          fields: coverImageFields("template"),
        }),
        defineField({
          name: "customImage",
          title: "Your finished cover",
          type: "image",
          description:
            "Upload your own design as JPG, PNG or WebP. Recommended: 1200 × 900 px (4:3). The complete image becomes the cover, with no template graphics added.",
          options: { hotspot: true, accept: "image/jpeg,image/png,image/webp" },
          hidden: (context) => !isCustomCover(context),
          fields: coverImageFields("custom"),
          validation: (rule) =>
            rule.custom(
              (value, { parent }) =>
                parent?.template !== "custom" ||
                Boolean(value?.asset) ||
                "Upload your finished cover before publishing.",
            ),
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Your article",
      type: "array",
      group: "story",
      description:
        "Write freely. Insert photos or a pair of photos using the add block menu.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Small heading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullets", value: "bullet" },
            { title: "Numbers", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "Address",
                    validation: (r) =>
                      r.uri({
                        scheme: ["http", "https", "mailto"],
                        allowRelative: true,
                      }),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          ...picture,
          title: "Photograph",
          fields: [
            ...imageFields,
            {
              name: "width",
              type: "string",
              title: "Layout",
              initialValue: "reading",
              options: {
                list: [
                  { title: "Within the text", value: "reading" },
                  { title: "Wide photograph", value: "wide" },
                ],
              },
            },
          ],
        }),
        defineArrayMember({
          name: "imagePair",
          type: "object",
          title: "Two photographs",
          fields: [
            {
              name: "images",
              title: "Images",
              type: "array",
              of: [picture],
              validation: (r) => r.required().length(2),
            },
          ],
          preview: {
            select: { media: "images.0" },
            prepare: ({ media }) => ({ title: "Two photographs", media }),
          },
        }),
      ],
      validation: required,
    }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      group: "settings",
      description:
        "Generate once, then keep it the same so shared links keep working.",
      options: { source: "title", maxLength: 96 },
      validation: (r) =>
        r.required().custom(async (slug, context) => {
          if (!slug?.current || !context.document?._id) return true;
          const id = context.document._id.replace(/^drafts\./, "");
          const published = await context
            .getClient({ apiVersion: "2026-09-01" })
            .withConfig({ perspective: "published" })
            .fetch("*[_id==$id][0].slug.current", { id });
          return (
            !published ||
            published === slug.current ||
            "This article is already published. Keep its original web address so shared links continue working."
          );
        }),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "settings",
      validation: required,
      options: {
        list: [
          "Cultural perspective",
          "Creator collaborations",
          "Experiences & community",
          "Studio notes",
        ],
      },
    }),
    defineField({
      name: "relatedService",
      title: "Related service",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Social Media Management", value: "social" },
          { title: "Influencer Marketing", value: "influencer" },
          { title: "Offline Activations", value: "offline" },
        ],
      },
      validation: required,
    }),
    defineField({
      name: "publishedAt",
      title: "Article date",
      type: "datetime",
      group: "settings",
      validation: required,
    }),
    defineField({
      name: "featured",
      title: "Feature this article",
      description: "Show first in the Journal and homepage carousel.",
      type: "boolean",
      group: "settings",
      initialValue: false,
    }),
    defineField({
      name: "sample",
      title: "Sample editorial",
      description:
        "Labels this as an illustrative article and excludes its page from search indexing.",
      type: "boolean",
      group: "settings",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "cover.photo" },
  },
  orderings: [
    {
      title: "Newest first",
      name: "dateDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
