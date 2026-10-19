import { load } from 'cheerio';

// The directory owns artwork and results; the homepage keeps a shorter introduction.
const homeSummaries = {
  'khao-soi': 'Creator stories for London’s Chinese food community.',
  'sen-sen': '5 creators per month sharing local recommendations.',
  'azuki-room': 'Creator-led discovery for a distinctive London experience.',
  'lotus-realm': 'Room tours that made a tea house worth sharing.',
};
export function composeHomeOverview(homeHtml, workHtml) {
  const home = load(homeHtml);
  const work = load(workHtml);
  const rail = home('[data-cases-rail]');
  if (!rail.length) return homeHtml;
  rail.find('.case-card').remove();
  for (const id of ['khao-soi', 'sen-sen', 'azuki-room', 'lotus-realm']) {
    const source = work('.case-grid > .case-card').filter((_, node) =>
      work(node).find(`a[href$="#${id}"]`).length > 0);
    if (source.length !== 1) throw new Error(`Expected one directory case for ${id}; found ${source.length}`);
    const card = source.clone().removeClass('reveal').removeAttr('data-case-category');
    card.find('h2').each((_, node) => { node.tagName = 'h3'; node.name = 'h3'; });
    card.find('.case-card__body > p').first().text(homeSummaries[id]);
    card.find('.case-card__meta span').slice(1).remove();
    card.find('.case-card__body > .kicker').remove();
    card.find('.case-card__body > p:has(strong)').addClass('home-case__result');
    rail.find('.home-cases__all').before(work.html(card));
  }
  return home.html();
}
