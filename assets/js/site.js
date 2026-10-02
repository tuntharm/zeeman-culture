(() => {
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");
  const body = document.body;
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const dropdowns = [...document.querySelectorAll(".nav-dropdown")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let lastFocusedElement = null;

  const setHeaderState = () => {
    if (!header) return;
    const threshold = body.classList.contains("page--home") ? 16 : 18;
    header.classList.toggle("is-scrolled", window.scrollY > threshold);
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
  let revealObserver = null;
  let revealScrollFrame = null;

  const revealPassedItems = () => {
    revealScrollFrame = null;
    const revealBoundary = window.innerHeight * 0.94;

    revealItems.forEach((item) => {
      if (item.hidden || item.classList.contains("is-visible")) return;
      if (item.getBoundingClientRect().top <= revealBoundary) {
        item.classList.add("is-visible");
        revealObserver?.unobserve(item);
      }
    });
  };

  const schedulePassedItemReveal = () => {
    if (revealScrollFrame !== null) return;
    revealScrollFrame = window.requestAnimationFrame(revealPassedItems);
  };

  const staggerRevealItems = () => {
    document
      .querySelectorAll(
        ".case-grid, .founder-grid, .process-grid, .related-services, .advantage-editorial, .home-service-list, .selected-case-grid",
      )
      .forEach((group) => {
        [...group.children]
          .filter((item) => item.classList.contains("reveal"))
          .forEach((item, index) => {
            item.style.setProperty(
              "--reveal-delay",
              `${Math.min(index, 4) * 80}ms`,
            );
          });
      });

    document
      .querySelectorAll(
        ".home-intro__copy.reveal, .home-intro__gallery.reveal, .service-gallery.reveal, .advantage-stack.reveal, .metric-row.reveal, .service-index.reveal, .image-strip.reveal, .trend-strip.reveal",
      )
      .forEach((group) => {
        group.classList.add("stagger-group");
        [...group.children].forEach((item, index) => {
          item.style.setProperty("--stagger-index", Math.min(index, 5));
        });
      });
  };

  const setupRevealMotion = () => {
    revealObserver?.disconnect();
    revealObserver = null;
    document.documentElement.classList.remove("motion-ready");

    revealItems.forEach((item) => item.classList.add("is-visible"));

    if (
      reducedMotion.matches ||
      connection?.saveData ||
      !("IntersectionObserver" in window) ||
      revealItems.length === 0
    ) {
      return;
    }

    staggerRevealItems();

    const initialBoundary = window.innerHeight * 0.96;
    revealItems.forEach((item) => {
      if (item.hidden) return;
      const bounds = item.getBoundingClientRect();
      item.classList.toggle(
        "is-visible",
        bounds.top <= initialBoundary && bounds.bottom >= 0,
      );
    });

    document.documentElement.classList.add("motion-ready");

    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.06,
      },
    );

    revealItems.forEach((item) => {
      if (!item.classList.contains("is-visible") && !item.hidden) {
        revealObserver.observe(item);
      }
    });

    revealPassedItems();
  };

  setupRevealMotion();
  window.addEventListener(
    "scroll",
    () => {
      schedulePassedItemReveal();
    },
    { passive: true },
  );
  reducedMotion.addEventListener?.("change", setupRevealMotion);

  const brandExchange = document.querySelector(".brand-exchange");
  let marqueeInView = !brandExchange;

  const syncDataSaverClass = () => {
    body.classList.toggle("data-saver", Boolean(connection?.saveData));
  };

  const setMarqueeState = () => {
    if (!brandExchange) return;

    const motionUnavailable = reducedMotion.matches || Boolean(connection?.saveData);
    const paused = document.hidden || motionUnavailable || !marqueeInView;
    brandExchange.classList.toggle("is-paused", paused);
  };

  syncDataSaverClass();

  if (brandExchange && "IntersectionObserver" in window) {
    const marqueeRoot = document.querySelector(".home-chapter") || brandExchange;
    marqueeInView = false;
    const marqueeObserver = new IntersectionObserver(
      ([entry]) => {
        marqueeInView = entry.isIntersecting;
        setMarqueeState();
      },
      { rootMargin: "80px 0px", threshold: 0.01 },
    );
    marqueeObserver.observe(marqueeRoot);
  } else {
    marqueeInView = true;
  }

  setMarqueeState();
  reducedMotion.addEventListener?.("change", setMarqueeState);

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
        if (visible) {
          caseItem.classList.remove("filter-enter");
          window.requestAnimationFrame(() => {
            caseItem.classList.add("filter-enter");
          });
        }
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
  const mobileVideo = window.matchMedia("(max-width: 620px)");
  const heroPlaybackRate = 2 / 3;
  const heroLoopFadeDuration = 520;
  const heroLoopFadeLead = 0.45;
  let heroLoopResetTimer = 0;
  let heroLoopResetting = false;

  const shouldLoadVideo = () =>
    Boolean(video) && !reducedMotion.matches && !connection?.saveData;

  const setHeroPlaybackRate = () => {
    if (!video) return;
    video.defaultPlaybackRate = heroPlaybackRate;
    video.playbackRate = heroPlaybackRate;
  };

  const playVideo = async () => {
    if (!shouldLoadVideo() || document.hidden) return;
    setHeroPlaybackRate();
    try {
      await video.play();
      video.classList.remove("is-unavailable");
    } catch {
      video.classList.add("is-unavailable");
    }
  };

  const cancelHeroLoopReset = () => {
    window.clearTimeout(heroLoopResetTimer);
    heroLoopResetTimer = 0;
    heroLoopResetting = false;
    video?.classList.remove("is-loop-fading");
  };

  const resetHeroLoop = () => {
    if (!video || heroLoopResetting || !shouldLoadVideo()) return;
    heroLoopResetting = true;
    video.classList.add("is-loop-fading");

    heroLoopResetTimer = window.setTimeout(async () => {
      if (!shouldLoadVideo() || document.hidden) {
        cancelHeroLoopReset();
        return;
      }

      video.currentTime = 0;
      setHeroPlaybackRate();
      try {
        await video.play();
        window.requestAnimationFrame(() => {
          video.classList.remove("is-loop-fading");
          heroLoopResetting = false;
          heroLoopResetTimer = 0;
        });
      } catch {
        video.classList.add("is-unavailable");
        cancelHeroLoopReset();
      }
    }, heroLoopFadeDuration);
  };

  const clearVideoSources = () => {
    if (!video) return;
    cancelHeroLoopReset();
    video.pause();
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach((source) => source.remove());
    video.removeAttribute("data-source-mode");
    video.classList.add("is-unavailable");
    video.load();
  };

  const addVideoSource = (src, type) => {
    if (!video || !src) return;
    const source = document.createElement("source");
    source.src = src;
    source.type = type;
    video.append(source);
  };

  const syncVideoSource = () => {
    if (!video) return;
    if (!shouldLoadVideo()) {
      clearVideoSources();
      return;
    }

    const sourceMode = mobileVideo.matches ? "mobile" : "desktop";
    video.poster = mobileVideo.matches
      ? video.dataset.mobilePoster
      : video.dataset.desktopPoster;
    if (video.dataset.sourceMode === sourceMode) {
      playVideo();
      return;
    }

    video.pause();
    cancelHeroLoopReset();
    video.querySelectorAll("source").forEach((source) => source.remove());

    if (sourceMode === "mobile") {
      addVideoSource(video.dataset.mobileMp4, "video/mp4");
    } else {
      addVideoSource(video.dataset.desktopWebm, "video/webm");
      addVideoSource(video.dataset.desktopMp4, "video/mp4");
    }

    video.dataset.sourceMode = sourceMode;
    video.classList.remove("is-unavailable");
    video.load();
    setHeroPlaybackRate();
    playVideo();
  };

  if (video) {
    video.addEventListener("loadedmetadata", setHeroPlaybackRate);
    video.addEventListener("canplay", playVideo);
    video.addEventListener("timeupdate", () => {
      if (
        Number.isFinite(video.duration) &&
        video.duration - video.currentTime <= heroLoopFadeLead
      ) {
        resetHeroLoop();
      }
    });
    video.addEventListener("ended", resetHeroLoop);

    video.addEventListener("error", () => {
      video.classList.add("is-unavailable");
    });

    syncVideoSource();
    reducedMotion.addEventListener?.("change", syncVideoSource);
    mobileVideo.addEventListener?.("change", syncVideoSource);
    connection?.addEventListener?.("change", () => {
      syncDataSaverClass();
      setupRevealMotion();
      setMarqueeState();
      syncVideoSource();
    });
  }

  document.addEventListener("visibilitychange", () => {
    setMarqueeState();
    if (!video) return;
    if (document.hidden) {
      cancelHeroLoopReset();
      video.pause();
    }
    else playVideo();
  });

  document.querySelectorAll("[data-year]").forEach((item) => {
    item.textContent = new Date().getFullYear();
  });
})();
