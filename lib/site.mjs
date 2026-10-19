import { load } from "cheerio";
import { validateArticle } from "./content.mjs";
import { JOURNAL_ENABLED } from "./features.mjs";
import {
  articleCard,
  homeCard,
  articleOpening,
  articleReading,
} from "./presentation.mjs";
export function decorate(html, journalEnabled = JOURNAL_ENABLED) {
  const $ = load(html);
  if (!journalEnabled) {
    $('#journal, a[href^="/journal"], a[href^="/studio"]').remove();
    $('link[href^="/assets/css/journal"], link[href^="/assets/css/home-journal"], script[src^="/assets/js/home-journal"]').remove();
    return $.html();
  }
  if (!$('link[href="/assets/css/journal-cms.css"]').length)
    $("head").append(
      '<link rel="stylesheet" href="/assets/css/journal-cms.css">',
    );
  if (!$('.footer-bottom a[href="/studio/"]').length)
    $(".footer-bottom").append('<a href="/studio/">Team login</a>');
  return $.html();
}
export function renderPage(path, docs, templates, config = {}) {
  const journalEnabled = config.journalEnabled ?? JOURNAL_ENABLED;
  if (!journalEnabled) {
    const $ = load(decorate(templates.home, false));
    if (path !== "/") {
      $('title').text('Page not found | Zeeman Culture');
      $('head').append('<meta name="robots" content="noindex,follow">');
      $('main').replaceWith('<main id="main" class="section-shell" style="padding-block:140px"><h1>Page not found.</h1><p><a href="/">Return to Zeeman Culture</a></p></main>');
      $('[data-scroll-vine], script[src*="home-vine"]').remove();
    }
    return { status: path === "/" ? 200 : 404, html: $.html() };
  }
  const articles = docs.filter(
    (doc) =>
      !String(doc._id || "").startsWith("drafts.") &&
      !validateArticle(doc).length,
  );
  const slug = path.match(/^\/journal\/([a-z0-9]+(?:-[a-z0-9]+)*)\/$/)?.[1];
  const article = slug && articles.find((d) => d.slug.current === slug);
  if (path !== "/" && path !== "/journal/" && !article)
    return {
      status: 404,
      html: decorate(templates.journal, true).replace(
        /<main[\s\S]*?<\/main>/,
        '<main id="main" class="section-shell" style="padding-block:140px"><h1>Article not found.</h1><p>This story may still be a draft.</p><a href="/journal/">Back to the Journal →</a></main>',
      ),
    };
  const $ = load(
    decorate(
      path === "/"
        ? templates.home
        : article
          ? templates.article
          : templates.journal,
      true,
    ),
  );
  if (path === "/") {
    $("[data-journal-rail]").html(
      articles
        .slice(0, 8)
        .map((d, i) => homeCard(d, config, i))
        .join(""),
    );
    if (!articles.length)
      $("[data-journal-carousel]").append(
        "<p>New stories are on their way.</p>",
      );
  } else if (!article) {
    $(".journal-stories").html(
      articles.length
        ? articleCard(articles[0], config, 0, true) +
            `<div class="journal-grid">${articles
              .slice(1)
              .map((d, i) => articleCard(d, config, i + 1))
              .join("")}</div>`
        : "<p>New stories are on their way.</p>",
    );
  } else {
    $("title").text(`${article.title} | Zeeman Culture`);
    $('meta[name="description"],meta[property="og:description"]').attr(
      "content",
      article.excerpt,
    );
    $('meta[property="og:title"]').attr("content", article.title);
    $('link[rel="canonical"]').attr("href", `https://zeemanculture.com${path}`);
    $('meta[property="og:url"]').attr(
      "content",
      `https://zeemanculture.com${path}`,
    );
    if (!article.sample && process.env.VERCEL_ENV === "production")
      $('meta[name="robots"]').remove();
    $(".journal-article__opening").html(articleOpening(article, config));
    $(".journal-article__reading").html(articleReading(article, config));
    const related = articles.filter((d) => d.slug.current !== slug).slice(0, 2);
    $(".journal-related .journal-grid").html(
      related.map((d, i) => articleCard(d, config, i)).join(""),
    );
    if (!related.length) $(".journal-related").remove();
  }
  return { status: 200, html: $.html() };
}
