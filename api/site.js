import templates from "../lib/generated-templates.mjs";
import { getArticles, cmsConfig } from "../lib/cms.mjs";
import { renderPage } from "../lib/site.mjs";
export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = url.searchParams.get("path") || url.pathname;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  try {
    const result = renderPage(
      path,
      await getArticles(),
      templates,
      cmsConfig(),
    );
    res.statusCode = result.status;
    res.end(result.html);
  } catch (error) {
    console.error("Journal unavailable:", error.statusCode || error.name);
    if (path === "/") {
      res.statusCode = 200;
      return res.end(renderPage("/", [], templates, cmsConfig()).html);
    }
    res.statusCode = 503;
    res.setHeader("Retry-After", "30");
    res.end(
      '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zeeman Journal</title><body><main><h1>The Journal is taking a moment.</h1><p>Please try again shortly.</p><a href="/about/">About Zeeman</a></main></body></html>',
    );
  }
}
