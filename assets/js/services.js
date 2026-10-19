(() => {
  const navigation = document.querySelector('[data-service-tabs]');
  if (!navigation) return;
  const tabs = [...navigation.querySelectorAll('[data-service-tab]')];
  const panels = [...document.querySelectorAll('[data-service-panel]')];
  const names = panels.map(panel => panel.dataset.servicePanel);
  const panelForHash = hash => {
    try { return document.getElementById(decodeURIComponent(hash.slice(1)))?.closest('[data-service-panel]'); }
    catch { return null; }
  };
  const activate = name => {
    tabs.forEach(tab => {
      const active = tab.dataset.serviceTab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.servicePanel !== name; });
  };
  const scrollToHash = hash => {
    const panel = panelForHash(hash);
    if (!panel) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
  };
  const restore = () => {
    const url = new URL(location.href);
    const hashPanel = panelForHash(url.hash);
    const requested = url.searchParams.get('service');
    const name = hashPanel?.dataset.servicePanel || (names.includes(requested) ? requested : names[0]);
    activate(name);
    if (url.hash) scrollToHash(url.hash);
  };
  navigation.setAttribute('role', 'tablist');
  tabs.forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `service-${tab.dataset.serviceTab}`);
  });
  panels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${panel.dataset.servicePanel}`);
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    const hashPanel = panelForHash(url.hash);
    if (url.hash && !hashPanel) return;
    const requested = link.dataset.serviceTab || hashPanel?.dataset.servicePanel || url.searchParams.get('service');
    if (!names.includes(requested)) return;
    event.preventDefault();
    url.searchParams.set('service', requested);
    history.pushState(null, '', url);
    activate(requested);
    // Tabs stay in place while their content changes; case/section links scroll to content.
    if (link.matches('[data-service-tab]')) {
      navigation.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else scrollToHash(url.hash || `#service-${requested}`);
  });
  navigation.addEventListener('keydown', event => {
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });
  addEventListener('popstate', restore);
  addEventListener('hashchange', restore);
  restore();
  // Correct late layout shifts for a direct case URL, unless the visitor has moved on.
  let interacted = false;
  for (const event of ['pointerdown', 'touchstart', 'wheel', 'keydown']) {
    addEventListener(event, () => { interacted = true; }, { once: true, passive: true });
  }
  const settle = () => { if (!interacted) scrollToHash(location.hash); };
  addEventListener('load', settle, { once: true });
  document.fonts?.ready.then(settle);
})();
