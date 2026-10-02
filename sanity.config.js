import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { article } from "./studio/schema.js";
import ArticlePreview from "./studio/components/ArticlePreview.jsx";
export default defineConfig({
  name: "zeeman",
  title: "Zeeman · Journal",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Journal desk")
          .items([S.documentTypeListItem("article").title("Your articles")]),
      defaultDocumentNode: (S, { schemaType }) =>
        schemaType === "article"
          ? S.document().views([
              S.view.form().title("Write"),
              S.view.component(ArticlePreview).title("Preview"),
            ])
          : S.document(),
    }),
  ],
  schema: { types: [article] },
});
