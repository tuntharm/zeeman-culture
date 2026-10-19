import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { decorate, renderPage } from "../lib/site.mjs";
import { composeHomeOverview } from "../lib/home-overview.mjs";

const serviceSlugs = [
  "influencer-marketing",
  "social-media-management",
  "offline-activations",
];
const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
const readHtml = async (path) => {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
};
const servicesHtml = await readHtml("services/index.html");
const homeSource = await readFile("index.html", "utf8");
const workSource = await readFile("work/index.html", "utf8");
const workHtml = decorate(workSource, false);
const services = load(servicesHtml);
const work = load(workHtml);
const templates = { home: composeHomeOverview(homeSource, workSource) };
const home = load(renderPage("/", [], templates, { journalEnabled: false }).html);

function caseWithTitle($, title, selector = ".case-card") {
  return $(selector).filter((_, node) => normalize($(node).find("h2, h3").first().text()) === title);
}

function expectServiceDestination(href, expectedService, expectedHash) {
  assert.ok(href, "The destination must be a real link");
  const url = new URL(href, "https://example.test");
  assert.equal(url.pathname, "/services/", href);
  assert.equal(url.searchParams.get("service"), expectedService, href);
  if (expectedHash) assert.equal(url.hash, `#${expectedHash}`, href);
  if (url.hash) {
    const target = services(`[id="${url.hash.slice(1)}"]`);
    assert.equal(target.length, 1, `A single destination exists for ${href}`);
    const panel = target.is("[data-service-panel]") ? target : target.closest("[data-service-panel]");
    assert.equal(panel.attr("id"), `service-${expectedService}`, href);
  }
}

test("Services is one document with three readable panels and valid accessible references", () => {
  assert.ok(servicesHtml, "Create services/index.html");
  assert.equal(services("h1").length, 1);
  assert.equal(services("main").length, 1);
  assert.deepEqual(
    services("[data-service-panel]").map((_, node) => services(node).attr("id")).get(),
    serviceSlugs.map((slug) => `service-${slug}`),
  );
  assert.equal(services("[data-service-tab]").length, 3);
  for (const slug of serviceSlugs) {
    const panel = services(`#service-${slug}`);
    assert.ok(normalize(panel.text()).length > 100, `${slug} has readable content`);
    assert.equal(panel.is("[hidden], [aria-hidden='true']"), false, `${slug} is readable before JavaScript`);
    const tab = services("[data-service-tab]").filter((_, node) => {
      const href = services(node).attr("href");
      return href && new URL(href, "https://example.test").searchParams.get("service") === slug;
    });
    assert.equal(tab.length, 1, `${slug} has one ordinary navigation link`);
    expectServiceDestination(tab.attr("href"), slug, `service-${slug}`);
  }
  const ids = services("[id]").map((_, node) => services(node).attr("id")).get();
  assert.equal(new Set(ids).size, ids.length, "Combined service content must not duplicate IDs");
  services("[aria-labelledby], [aria-controls]").each((_, node) => {
    for (const attribute of ["aria-labelledby", "aria-controls"]) {
      for (const id of (services(node).attr(attribute) || "").split(/\s+/).filter(Boolean)) {
        assert.ok(ids.includes(id), `${attribute} points to missing #${id}`);
      }
    }
  });
});

test("Instagram and Rednote cases remain distinct, with bixdo kept as an unquantified service example", () => {
  const influencer = services("#service-influencer-marketing");
  assert.equal(influencer.find("#instagram").length, 1);
  assert.equal(influencer.find("#rednote").length, 1);
  for (const id of ["hazzys-instagram", "joybuy-instagram", "bixdo"]) {
    assert.equal(influencer.find(`#${id}`).length, 1, `${id} is present`);
    assert.equal(influencer.find(`#${id}`).closest("#instagram").length, 1, `${id} is in Instagram`);
  }
  for (const id of ["khao-soi", "sen-sen", "azuki-room"]) {
    assert.equal(influencer.find(`#${id}`).length, 1, `${id} is present`);
    assert.equal(influencer.find(`#${id}`).closest("#rednote").length, 1, `${id} is in Rednote`);
  }
  const bixdo = influencer.find("#bixdo");
  assert.match(bixdo.text(), /bixdo|倍至/i);
  assert.doesNotMatch(bixdo.text(), /\b(?:views|likes|saves|reach|results?)\b|\d+\s*%/i);
  assert.equal(bixdo.find('a[href=""], a[href="#"]').length, 0);
  for (const id of ["hazzys", "joybuy", "zoey-filigree", "fluid-civilization"]) {
    assert.equal(services(`#service-offline-activations #${id}`).length, 1, `Keep Offline #${id}`);
  }
  for (const id of ["dram5", "lotus-realm"]) {
    assert.equal(services(`#service-social-media-management #${id}`).length, 1, `Keep Social #${id}`);
  }
  assert.doesNotMatch(normalize(influencer.find("#hazzys-instagram").text()), /(?:all|100%\s+of)\s+posts\s+(?:above|over)\s+1,?000\s+likes/i);
});

test("directory has nine records and five Influencer, two Social, four Offline memberships", () => {
  const cards = work(".case-grid > .case-card");
  assert.equal(cards.length, 9);
  const counts = Object.fromEntries(["influencer", "social", "offline"].map((category) => [
    category,
    cards.filter((_, node) => (work(node).attr("data-case-category") || "").split(/\s+/).includes(category)).length,
  ]));
  assert.deepEqual(counts, { influencer: 5, social: 2, offline: 4 });
  assert.equal(caseWithTitle(work, "bixdo").length, 0, "bixdo is not a full case record");
  for (const [title, id] of [["Hazzys", "hazzys"], ["Joybuy", "joybuy"]]) {
    const card = caseWithTitle(work, title);
    assert.equal(card.length, 1, `One shared directory record for ${title}`);
    const links = card.find("a[href]").map((_, node) => work(node).attr("href")).get();
    for (const [service, hash] of [["influencer-marketing", `${id}-instagram`], ["offline-activations", id]]) {
      const link = links.find((href) => new URL(href, "https://example.test").hash === `#${hash}`);
      expectServiceDestination(link, service, hash);
    }
    assert.match(card.find(".case-card__body").text(), /offline/i, `${title} retains an explicit Offline label`);
  }
});

test("composed homepage carousel reuses the four directory phone compositions and ends with the Cases directory", () => {
  const rail = home("#cases [data-cases-rail]");
  assert.equal(rail.length, 1);
  const cards = rail.find(".case-card");
  const expected = ["Khao So-i", "Sen Sen", "Azuki Room", "Lotus Realm"];
  assert.deepEqual(cards.map((_, node) => normalize(home(node).find("h3").first().text())).get(), expected);
  for (const title of expected) {
    const original = caseWithTitle(work, title);
    const copy = caseWithTitle(home, title, "#cases .case-card");
    assert.equal(copy.find("h2").length, 0, `${title} fits the homepage heading hierarchy`);
    assert.equal(copy.hasClass("reveal"), false, `${title} does not rely on an offscreen reveal observer`);
    assert.equal(copy.find(".case-card__media--phones img").length, 2, title);
    assert.deepEqual(
      copy.find(".case-card__media img").map((_, node) => home(node).attr("src")).get(),
      original.find(".case-card__media img").map((_, node) => work(node).attr("src")).get(),
      `${title} uses the existing artwork`,
    );
    assert.equal(normalize(copy.find(".home-case__result").text()), normalize(original.find(".case-card__body > p:has(strong)").text()), `${title} preserves the directory result`);
    assert.ok(normalize(copy.find(".case-card__body > p").first().text()).length < normalize(original.find(".case-card__body > p").first().text()).length, `${title} uses a concise homepage introduction`);
    assert.equal(copy.find(".case-card__meta span").length, 1, `${title} has one category label`);
    assert.equal(copy.find(".kicker").length, 0, `${title} avoids a redundant result label`);
    for (const href of copy.find("a[href]").map((_, node) => home(node).attr("href")).get()) {
      const url = new URL(href, "https://example.test");
      expectServiceDestination(href, title === "Lotus Realm" ? "social-media-management" : "influencer-marketing", url.hash.slice(1));
    }
  }
  assert.equal(rail.find(".home-cases__all").length, 1);
  assert.equal(rail.find('a.home-cases__all[href="/work/"], .home-cases__all a[href="/work/"]').length, 1);
  assert.equal(rail.children().last().hasClass("home-cases__all"), true, "The final card links to all cases");
});

test("carousel composition rejects missing or duplicated source cases", () => {
  const missing = load(workSource);
  caseWithTitle(missing, "Khao So-i").remove();
  assert.throws(() => composeHomeOverview(homeSource, missing.html()), "A missing case cannot silently produce an incomplete carousel");

  const duplicate = load(workSource);
  const original = caseWithTitle(duplicate, "Khao So-i");
  original.parent().append(original.clone());
  assert.throws(() => composeHomeOverview(homeSource, duplicate.html()), "A duplicate case cannot silently select ambiguous content");
});

test("homepage presents the approved section order, both founder destinations and no paused editorial links", async () => {
  const order = ["advantages", "partners", "services", "cases", "founders", "contact"];
  const actual = home("[id]").map((_, node) => home(node).attr("id")).get().filter((id) => order.includes(id));
  assert.deepEqual(actual, order);
  const founders = home("#founders");
  assert.match(normalize(founders.text()), /Betty.*Mengzhu Cao/s);
  assert.match(normalize(founders.text()), /Yang.*Jinghang Yang/s);
  assert.equal(founders.find('img[src*="mengzhu-cao"]').length, 1);
  assert.equal(founders.find('img[src*="jinghang-yang"]').length, 1);
  assert.equal(founders.find('a[href="/about/"]').length, 1);
  const about = load(await readFile("about/index.html", "utf8"));
  for (const [id, name] of [["mengzhu-cao", "Mengzhu Cao"], ["jinghang-yang", "Jinghang Yang"]]) {
    assert.equal(founders.find(`a[href="/about/#${id}"]`).length, 1, `${name} has a direct founder link`);
    assert.equal(about(`#${id}`).length, 1, `${name} has one destination on About`);
    assert.equal(normalize(about(`#${id} h3`).text()), name);
  }
  assert.equal(home('#journal, a[href^="/journal"], a[href^="/studio"]').length, 0);
});

test("brand rows contain all 17 distinct entries in the approved market order", () => {
  const expected = [
    ["hazzys", "joybuy", "jd", "moutai", "trip-com", "bixdo", "tcl"],
    ["dram5", "lotus-realm", "azuki-room", "bellybliss", "khao-soi", "patara", "sen-sen", "platapian", "dangs", "flying-fat-sheep"],
  ];
  const groups = home("#partners .brand-lane__group").filter((_, node) => home(node).attr("aria-hidden") !== "true");
  assert.equal(groups.length, 2);
  groups.each((index, node) => {
    assert.deepEqual(home(node).find("[data-brand]").map((_, entry) => home(entry).attr("data-brand")).get(), expected[index]);
  });
  assert.match(normalize(home("#partners").text()), /Selected agency and creator-network collaborations\./);
  const azuki = home('[data-brand="azuki-room"]').filter((_, node) => !home(node).closest('[aria-hidden="true"]').length);
  assert.ok(azuki.find("img").length === 1 || azuki.is("[data-logo-fallback]"), "Azuki uses verified artwork or an explicitly marked brand-name fallback");
  assert.doesNotMatch(azuki.text(), /紅豆|红豆/);
  const linkable = new Set(["hazzys", "joybuy", "dram5", "lotus-realm", "azuki-room", "khao-soi", "sen-sen"]);
  groups.find("[data-brand]").each((_, node) => {
    const entry = home(node);
    if (!linkable.has(entry.attr("data-brand"))) assert.equal(entry.is("a") || entry.find("a").length > 0, false, "Only case-backed brands have case links");
  });
});

test("every public header and footer Services link goes to the unified page", async () => {
  const pages = [
    ["homepage", home.html()],
    ["services", decorate(servicesHtml, false)],
    ["work", workHtml],
  ];
  for (const path of ["about/index.html", "contact/index.html", "privacy/index.html"]) {
    pages.push([path, decorate(await readFile(path, "utf8"), false)]);
  }
  for (const [name, html] of pages) {
    const $ = load(html);
    const links = $("header a, footer a").filter((_, node) => normalize($(node).text()).toLowerCase() === "services");
    assert.ok(links.length > 0, `${name} has a Services navigation link`);
    links.each((_, node) => assert.equal($(node).attr("href"), "/services/", name));
  }
  const serviceCards = home("#services .home-service-card");
  assert.equal(serviceCards.length, 3);
  serviceCards.each((index, node) => expectServiceDestination(home(node).attr("href"), serviceSlugs[index]));
});

test("legacy service redirects use the matching tab without overwriting existing case fragments", async () => {
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  for (const slug of serviceSlugs) {
    const rule = (config.redirects || []).find((redirect) => redirect.source === `/services/${slug}/`);
    assert.ok(rule, `Vercel redirects /services/${slug}/`);
    assert.ok(rule.permanent === true || rule.statusCode === 308, "Legacy redirects are permanent");
    const url = new URL(rule.destination, "https://example.test");
    assert.equal(url.pathname, "/services/");
    assert.equal(url.searchParams.get("service"), slug);
    assert.equal(url.hash, "", "A redirect must allow the browser to retain the original fragment");
  }
});

test("local HTTP redirects and rendered routes agree with the built Services document", { skip: !process.env.TEST_ORIGIN }, async () => {
  const origin = process.env.TEST_ORIGIN;
  const page = await fetch(`${origin}/services/`);
  assert.equal(page.status, 200);
  const $ = load(await page.text());
  assert.equal($("[data-service-panel]").length, 3);
  const homepageResponse = await fetch(`${origin}/`);
  assert.equal(homepageResponse.status, 200);
  const homepage = load(await homepageResponse.text());
  assert.deepEqual(
    homepage("#cases .case-card h3").map((_, node) => normalize(homepage(node).text())).get(),
    ["Khao So-i", "Sen Sen", "Azuki Room", "Lotus Realm"],
    "The API homepage uses the built carousel template",
  );
  for (const slug of serviceSlugs) {
    for (const suffix of ["", "/"]) {
      const response = await fetch(`${origin}/services/${slug}${suffix}`, { redirect: "manual" });
      assert.equal(response.status, 308, `${slug}${suffix}`);
      const destination = new URL(response.headers.get("location"), origin);
      assert.equal(destination.pathname, "/services/");
      assert.equal(destination.searchParams.get("service"), slug);
      assert.equal(destination.hash, "");
    }
  }
});
