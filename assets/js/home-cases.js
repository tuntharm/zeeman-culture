(() => {
  const carousel = document.querySelector('[data-cases-carousel]');
  if (!carousel) return;
  const rail = carousel.querySelector('[data-cases-rail]');
  const cards = [...rail.children];
  const previous = carousel.querySelector('[data-cases-prev]');
  const next = carousel.querySelector('[data-cases-next]');
  const status = carousel.querySelector('[data-cases-position]');
  if (cards.length < 2) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const left = card => card.offsetLeft;
  const behavior = () => motion.matches ? 'instant' : 'smooth';
  let frame = 0;
  const sync = () => {
    frame = 0;
    previous.disabled = rail.scrollLeft <= left(cards[0]) + 2;
    next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
    const visible = cards.map((card, i) => ({ i, left: left(card), width: card.offsetWidth }))
      .filter(card => card.left >= rail.scrollLeft - 2 && card.left + card.width <= rail.scrollLeft + rail.clientWidth + 2);
    const first = visible[0]?.i ?? 0;
    const last = visible.at(-1)?.i ?? first;
    status.textContent = first === 4 ? 'View all cases' : `Case${last > first ? 's' : ''} ${first + 1}${last > first ? `–${Math.min(4, last + 1)}` : ''} of 4${last === 4 ? ' · View all cases' : ''}`;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
  const move = direction => rail.scrollBy({ left: direction * (left(cards[1]) - left(cards[0])), behavior: behavior() });
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  rail.addEventListener('scroll', schedule, { passive: true });
  rail.addEventListener('keydown', event => {
    if (event.target !== rail) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); rail.scrollTo({ left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior: behavior() });
    }
  });
  rail.addEventListener('focusin', event => {
    const card = event.target.closest('.case-card, .home-cases__all');
    if (!card) return;
    if (left(card) < rail.scrollLeft || left(card) + card.offsetWidth > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left: left(card), behavior: behavior() });
    }
  });
  addEventListener('resize', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(rail);
  carousel.querySelector('[data-cases-controls]').hidden = false;
  sync();
})();
