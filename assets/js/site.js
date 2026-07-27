(() => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const dropdowns = [...document.querySelectorAll(".nav-dropdown")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lastFocusedElement = null;

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  const closeDropdowns = (except = null) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown === except) return;
      dropdown.classList.remove("is-open");
      dropdown
        .querySelector("[data-dropdown-toggle]")
        ?.setAttribute("aria-expanded", "false");
    });
  };

  const closeNav = ({ restoreFocus = false } = {}) => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    body.classList.remove("nav-open");
    closeDropdowns();
    if (restoreFocus && lastFocusedElement) lastFocusedElement.focus();
  };

  const openNav = () => {
    if (!nav || !navToggle) return;
    lastFocusedElement = document.activeElement;
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation");
    body.classList.add("nav-open");
    nav.querySelector("a, button")?.focus();
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  navToggle?.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeNav({ restoreFocus: true });
    else openNav();
  });

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-dropdown-toggle]");

    const setDropdownState = (open) => {
      dropdown.classList.toggle("is-open", open);
      toggle?.setAttribute("aria-expanded", String(open));
    };

    toggle?.addEventListener("click", (event) => {
      event.preventDefault();
      const willOpen = !dropdown.classList.contains("is-open");
      closeDropdowns(dropdown);
      setDropdownState(willOpen);
    });

    dropdown.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!dropdown.contains(document.activeElement)) closeDropdowns();
      }, 0);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-dropdown")) closeDropdowns();
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeNav());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (body.classList.contains("nav-open")) {
        closeNav({ restoreFocus: true });
      } else {
        closeDropdowns();
      }
    }

    if (
      event.key === "Tab" &&
      body.classList.contains("nav-open") &&
      nav &&
      navToggle
    ) {
      const focusable = [
        navToggle,
        ...nav.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter(
        (element) =>
          element.getClientRects().length > 0 &&
          getComputedStyle(element).visibility !== "hidden",
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeNav();
  });

  const revealItems = [...document.querySelectorAll(".reveal")];
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const cases = [...document.querySelectorAll("[data-case-category]")];
  const filterStatus = document.querySelector("[data-filter-status]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      cases.forEach((caseItem) => {
        const categories = caseItem.dataset.caseCategory
          .split(" ")
          .filter(Boolean);
        const visible = filter === "all" || categories.includes(filter);
        caseItem.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (filterStatus) {
        filterStatus.textContent = `${visibleCount} case ${
          visibleCount === 1 ? "study" : "studies"
        } shown`;
      }
    });
  });

  const video = document.querySelector("[data-hero-video]");

  const playVideo = async () => {
    if (!video) return;
    try {
      await video.play();
      video.classList.remove("is-unavailable");
    } catch {
      video.classList.add("is-unavailable");
    }
  };

  if (video) {
    if (reducedMotion.matches) {
      video.pause();
      video.currentTime = 0;
    } else {
      playVideo();
    }

    video.addEventListener("error", () => {
      video.classList.add("is-unavailable");
    });

    reducedMotion.addEventListener?.("change", (event) => {
      if (event.matches) {
        video.pause();
        video.currentTime = 0;
      } else {
        playVideo();
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach((item) => {
    item.textContent = new Date().getFullYear();
  });
})();
