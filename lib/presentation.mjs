import { escapeHtml as e, imageUrl, renderBody } from "./content.mjs";
import { renderCover, coverPhotoSize } from "./cover.mjs";
export const services = {
  social: ["Social Media Management", "/services/social-media-management/"],
  influencer: ["Influencer Marketing", "/services/influencer-marketing/"],
  offline: ["Offline Activations", "/services/offline-activations/"],
};
export function readingTime(doc) {
  const words = (doc.body || [])
    .flatMap((b) => (b.children || []).map((c) => c.text || ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}
export function coverMarkup(doc, config = {}, prefix = "cover") {
  return renderCover(doc.cover || {}, {
    photoUrl: imageUrl(
      doc.cover?.template === "custom"
        ? doc.cover?.customImage
        : doc.cover?.photo,
      {
        ...config,
        ...coverPhotoSize(doc.cover?.template),
      },
    ),
    idPrefix: prefix,
  });
}
export function articleOpening(doc, config = {}) {
  return `<div class="journal-article__introduction"><div class="journal-meta"><span>${e(doc.category || "Journal")}</span><span>${readingTime(doc)}</span></div><h1>${e(doc.title || "Your article title")}</h1><p class="journal-article__standfirst">${e(doc.excerpt || "Your introduction will appear here.")}</p>${doc.sample ? '<span class="journal-sample">Sample editorial</span>' : ""}</div><div class="journal-article__art">${coverMarkup(doc, config, "hero")}</div>`;
}
export function articleReading(doc, config = {}) {
  const service = services[doc.relatedService];
  return `<aside class="journal-article__note">${doc.sample ? "<span>Sample editorial</span><p>An illustrative article for this journal. It does not describe a Zeeman client campaign.</p>" : "<span>Zeeman Journal</span><p>Notes on brands, creators and cultural connection.</p>"}</aside><div class="journal-article__body" data-article-body>${renderBody(doc.body || [], config)}</div>${service ? `<div class="journal-service"><span>Explore the practice</span><a href="${service[1]}">${service[0]} <span aria-hidden="true">↗</span></a></div>` : ""}`;
}
export function articleCard(doc, config = {}, index = 0, featured = false) {
  return `<article class="journal-card${featured ? " journal-card--featured" : ""}"><a class="journal-card__link" href="/journal/${e(doc.slug.current)}/"><div class="journal-card__image">${coverMarkup(doc, config, `card-${index}`)}</div><div class="journal-card__copy"><div class="journal-meta"><span>${e(doc.category)}</span><span>${readingTime(doc)}</span></div><h2>${e(doc.title)}</h2><p>${e(doc.excerpt)}</p><span class="journal-card__read">Read the story ↗</span>${doc.sample ? '<span class="journal-sample">Sample editorial</span>' : ""}</div></a></article>`;
}
export function homeCard(doc, config = {}, index = 0) {
  return `<li class="home-journal__card"><a class="home-journal__image" href="/journal/${e(doc.slug.current)}/" tabindex="-1" aria-hidden="true">${coverMarkup(doc, config, `home-${index}`)}</a><div class="home-journal__copy"><p class="home-journal__meta">${e(doc.category)} <span>${readingTime(doc)}</span></p>${doc.sample ? '<p class="home-journal__sample">Sample editorial</p>' : ""}<h3><a href="/journal/${e(doc.slug.current)}/">${e(doc.title)}</a></h3><p>${e(doc.excerpt)}</p><span class="home-journal__read" aria-hidden="true">Read the story ↗</span></div></li>`;
}
