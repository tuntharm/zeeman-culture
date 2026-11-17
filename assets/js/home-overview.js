(() => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  // Proof numbers roll into place like an odometer when their card appears,
  // and roll again on hover. Without motion they simply show their value.
  const counters = [...document.querySelectorAll("[data-count-up]")];

  const buildOdometer = (node) => {
    const value = node.textContent.trim();
    node.textContent = "";
    const label = document.createElement("span");
    label.className = "sr-only";
    label.textContent = value;
    node.append(label);
    [...value].forEach((character) => {
      if (!/\d/.test(character)) {
        const glyph = document.createElement("span");
        glyph.className = "odometer__char";
        glyph.setAttribute("aria-hidden", "true");
        glyph.textContent = character;
        node.append(glyph);
        return;
      }
      const digit = document.createElement("span");
      digit.className = "odometer__digit";
      digit.setAttribute("aria-hidden", "true");
      digit.dataset.value = character;
      // The hidden final digit gives the column its natural width.
      const ghost = document.createElement("span");
      ghost.className = "odometer__ghost";
      ghost.textContent = character;
      const strip = document.createElement("span");
      strip.className = "odometer__strip";
      for (let index = 0; index < 20; index += 1) {
        const cell = document.createElement("span");
        cell.textContent = String(index % 10);
        strip.append(cell);
      }
      digit.append(ghost, strip);
      node.append(digit);
    });
  };

  const roll = (node) => {
    const digits = [...node.querySelectorAll(".odometer__digit")];
    digits.forEach((digit) => {
      const strip = digit.querySelector(".odometer__strip");
      strip.style.transition = "none";
      strip.style.transform = "translate(-50%, 0)";
    });
    // Commit the reset before rolling to the final position.
    void node.offsetWidth;
    digits.forEach((digit, index) => {
      const strip = digit.querySelector(".odometer__strip");
      strip.style.transition = "";
      strip.style.transitionDelay = `${index * 90}ms`;
      strip.style.transform = `translate(-50%, ${-(10 + Number(digit.dataset.value))}em)`;
    });
  };

  if (counters.length && !motion.matches && "IntersectionObserver" in window) {
    counters.forEach(buildOdometer);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          roll(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((node) => {
      observer.observe(node);
      node.closest(".proof-card")?.addEventListener("pointerenter", () => {
        if (finePointer.matches && !motion.matches) roll(node);
      });
    });
  }

  // The services visual follows the open service, and previews whichever
  // service the pointer rests on.
  const list = document.querySelector("[data-services-list]");
  if (!list) return;
  const items = [...list.querySelectorAll("details[data-service]")];
  const visuals = [...document.querySelectorAll("[data-service-visual]")];
  const show = (service) => {
    visuals.forEach((visual) => {
      visual.classList.toggle("is-active", visual.dataset.serviceVisual === service);
    });
  };
  const current = () => (items.find((item) => item.open) || items[0])?.dataset.service;

  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        // Browsers without exclusive <details name> still keep one open.
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
      show(current());
    });
    item.querySelector("summary")?.addEventListener("pointerenter", () => {
      if (finePointer.matches) show(item.dataset.service);
    });
  });
  list.addEventListener("pointerleave", () => show(current()));
})();
