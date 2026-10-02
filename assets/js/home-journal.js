(() => {
  const carousel = document.querySelector('[data-journal-carousel]');
  if (!carousel) return;
  const rail = carousel.querySelector('[data-journal-rail]');
  const previous = carousel.querySelector('[data-journal-prev]');
  const next = carousel.querySelector('[data-journal-next]');
  const position = carousel.querySelector('[data-journal-position]');
  const cards = [...rail.children];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const sync = () => {
    frame = 0;
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    previous.disabled = rail.scrollLeft <= cards[0].offsetLeft + 2;
    next.disabled = rail.scrollLeft >= max - 2;
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : rail.clientWidth;
    const index = Math.min(cards.length - 1, Math.round(rail.scrollLeft / Math.max(1, step)));
    const complete = cards.map((card, i) => ({ i, left: card.offsetLeft, width: card.offsetWidth }))
      .filter(card => card.left >= rail.scrollLeft - 2 && card.left + card.width <= rail.scrollLeft + rail.clientWidth + 2);
    const first = complete[0]?.i ?? index;
    const last = complete.at(-1)?.i ?? index;
    const label = first === last ? `Article ${first + 1} of ${cards.length}` : `Articles ${first + 1}–${last + 1} of ${cards.length}`;
    if (position.textContent !== label) position.textContent = label;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
  const move = direction => {
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : rail.clientWidth;
    rail.scrollBy({ left: direction * step, behavior: motion.matches ? 'instant' : 'smooth' });
  };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  rail.addEventListener('scroll', schedule, { passive: true });
  rail.addEventListener('focusin', event => {
    const card = event.target.closest('.home-journal__card');
    if (!card) return;
    const left = card.offsetLeft;
    if (left < rail.scrollLeft || left + card.offsetWidth > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left, behavior: motion.matches ? 'instant' : 'smooth' });
    }
  });
  addEventListener('resize', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(rail);
  carousel.querySelector('[data-journal-controls]').hidden = false;
  sync();
})();
