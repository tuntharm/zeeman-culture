import { createClient } from "@sanity/client";
export function cmsConfig() {
  return {
    projectId:
      process.env.SANITY_API_PROJECT_ID ||
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset:
      process.env.SANITY_API_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
  };
}
export async function getArticles() {
  const config = cmsConfig();
  if (!config.projectId || !config.dataset)
    throw new Error("Journal connection is not configured");
  const client = createClient({
    ...config,
    apiVersion: "2026-09-01",
    useCdn: false,
    perspective: "published",
    token: process.env.SANITY_API_READ_TOKEN,
    timeout: 10000,
  });
  return client.fetch(
    '*[_type == "article" && !(_id in path("drafts.**"))] | order(featured desc, publishedAt desc)',
  );
}
