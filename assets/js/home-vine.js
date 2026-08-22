(() => {
  const story = document.querySelector("[data-home-story]");
  const vine = document.querySelector("[data-scroll-vine]");
  if (!story || !vine) return;

  const mainStrokes = [...vine.querySelectorAll(".home-scroll-vine__stroke")];
  const branches = [...vine.querySelectorAll("[data-vine-segment]")];
  const leaves = [...vine.querySelectorAll("[data-vine-leaf]")];
  const gradients = [...vine.querySelectorAll("[data-vine-gradient]")];
  const advantages = story.querySelector("#advantages");
  const services = story.querySelector(".home-services");
  const footer = story.querySelector(".home-footer");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const DESKTOP_HEAD_RATIO = 0.6;
  const MOBILE_HEAD_RATIO = 0.6;
  const BRANCH_HEAD_GATE = 0.035;
  const BRANCH_FADE_SPAN = 0.1;
  const DESKTOP_JUNCTION_CLEARANCE = 112;
  const MOBILE_JUNCTION_CLEARANCE = 58;
  const LEAF_GAP = 0.11;
  const LEAF_REVEAL_DURATION = 0.055;
  const mainProfiles = new Map();
  const pathLengths = new WeakMap();
  let frame = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const prefersStatic = () =>
    reducedMotion.matches || Boolean(connection?.saveData);

  const getPathLength = (path) => {
    if (!path || typeof path.getTotalLength !== "function") return 0;
    const cached = pathLengths.get(path);
    if (cached) return cached;
    const length = path.getTotalLength();
    pathLengths.set(path, length);
    return length;
  };

  const setPathProgress = (path, progress) => {
    const length = getPathLength(path);
    if (!length) return;
    const visibleProgress = clamp(progress);
    path.style.strokeDasharray = `${length} ${length}`;
    path.style.strokeDashoffset = `${length * (1 - visibleProgress)}`;
    path.dataset.drawProgress = visibleProgress.toFixed(4);
  };

  const getMainProfile = (svg) => {
    if (!svg) return null;
    const cached = mainProfiles.get(svg);
    if (cached) return cached;

    const stem = svg.querySelector(".home-scroll-vine__stroke--main");
    if (!stem || typeof stem.getTotalLength !== "function") return null;

    const total = stem.getTotalLength();
    const steps = 1400;
    const samples = Array.from({ length: steps + 1 }, (_, index) => {
      const ratio = index / steps;
      return { ratio, point: stem.getPointAtLength(total * ratio) };
    });
    const profile = { samples, stem, total };
    mainProfiles.set(svg, profile);
    return profile;
  };

  const getActiveSvg = () =>
    [...vine.querySelectorAll(".home-scroll-vine__art")].find(
      (svg) => window.getComputedStyle(svg).display !== "none",
    );

  const progressAtY = (profile, targetY) => {
    if (!profile) return 0;
    const { samples } = profile;
    if (targetY <= samples[0].point.y) return 0;
    if (targetY >= samples.at(-1).point.y) return 1;

    let low = 0;
    let high = samples.length - 1;
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      if (samples[middle].point.y < targetY) low = middle;
      else high = middle;
    }

    const before = samples[low];
    const after = samples[high];
    const span = Math.max(0.001, after.point.y - before.point.y);
    const mix = clamp((targetY - before.point.y) / span);
    return before.ratio + (after.ratio - before.ratio) * mix;
  };

  const hideEverything = () => {
    vine.dataset.vineState = "ready";
    vine.style.setProperty("--vine-progress", "0");
    branches.forEach((branch) => {
      branch.dataset.progress = "0";
      branch.style.setProperty("--segment-reveal", "0");
      branch.style.visibility = "hidden";
      setPathProgress(branch, 0);
    });
    leaves.forEach((leaf) => {
      leaf.style.setProperty("--leaf-reveal", "0");
      leaf.style.visibility = "hidden";
    });
    mainStrokes.forEach((stroke) => {
      setPathProgress(stroke, 0);
      stroke.style.willChange = "auto";
    });
  };

  const calibrateBranches = () => {
    branches.forEach((branch) => {
      const svg = branch.closest("svg");
      if (!svg) return;
      const profile = getMainProfile(svg);
      if (!profile) return;

      const anchorX = Number(branch.dataset.anchorX);
      const anchorY = Number(branch.dataset.anchorY);
      let nearest = profile.samples[0];
      let nearestDistance = Number.POSITIVE_INFINITY;

      profile.samples.forEach((sample) => {
        const dx = sample.point.x - anchorX;
        const dy = sample.point.y - anchorY;
        const distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearest = sample;
          nearestDistance = distance;
        }
      });

      const duration = Number(branch.dataset.duration || 0.055);
      const isMobile = svg.classList.contains("home-scroll-vine__art--mobile");
      const clearance = isMobile
        ? MOBILE_JUNCTION_CLEARANCE
        : DESKTOP_JUNCTION_CLEARANCE;
      const start = clamp(nearest.ratio + clearance / profile.total);
      branch.dataset.junction = nearest.ratio.toFixed(4);
      branch.dataset.start = start.toFixed(4);
      branch.dataset.end = clamp(start + duration).toFixed(4);
    });
  };

  const positionLeaves = () => {
    leaves.forEach((leaf) => {
      const branchId = leaf.dataset.vineLeafFor;
      const branch = branchId ? document.getElementById(branchId) : null;
      const node = leaf.closest(".home-scroll-vine__leaf-node");
      if (!branch || !node || typeof branch.getTotalLength !== "function") return;

      const total = branch.getTotalLength();
      const at = clamp(Number(leaf.dataset.leafAt || 0.82), 0.08, 0.96);
      const distance = total * at;
      const sampleGap = Math.max(1.5, total * 0.008);
      const before = branch.getPointAtLength(Math.max(0, distance - sampleGap));
      const after = branch.getPointAtLength(Math.min(total, distance + sampleGap));
      const point = branch.getPointAtLength(distance);
      const tangent = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
      const leafAngle = Number(leaf.dataset.leafAngle || 0);
      const leafScale = Number.parseFloat(
        window.getComputedStyle(leaf).getPropertyValue("--leaf-scale"),
      ) || 0.7;
      const isMobileLeaf = leaf.ownerSVGElement?.classList.contains(
        "home-scroll-vine__art--mobile",
      );
      const petioleLength = isMobileLeaf
        ? 11
        : leaf.classList.contains("home-scroll-vine__leaf--optional")
          ? 24
          : 16;
      let petiole = leaf.querySelector(".home-scroll-vine__leaf-petiole");
      if (!petiole) {
        petiole = document.createElementNS("http://www.w3.org/2000/svg", "path");
        petiole.classList.add("home-scroll-vine__leaf-petiole");
        petiole.setAttribute(
          "d",
          `M0 0C${(petioleLength * 0.34).toFixed(1)} -0.4 ${(petioleLength * 0.68).toFixed(1)} 0.4 ${petioleLength + 2} 0`,
        );
        leaf.prepend(petiole);
      }
      leaf.querySelector("use")?.setAttribute(
        "transform",
        `translate(${petioleLength} 0)`,
      );

      node.setAttribute(
        "transform",
        `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${(
          tangent + leafAngle
        ).toFixed(2)}) scale(${leafScale.toFixed(3)})`,
      );
    });
  };

  const updateToneRanges = () => {
    if (!services || !footer || !gradients.length) return;

    const storyRect = story.getBoundingClientRect();
    const storyTop = storyRect.top + window.scrollY;
    const storyHeight = Math.max(1, story.offsetHeight);
    const relativeRange = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        start: clamp((rect.top + window.scrollY - storyTop) / storyHeight),
        end: clamp((rect.bottom + window.scrollY - storyTop) / storyHeight),
      };
    };

    const serviceRange = relativeRange(services);
    const footerRange = relativeRange(footer);
    const blend = clamp(36 / storyHeight, 0.006, 0.014);
    const offsets = {
      base: 0,
      "services-before": clamp(serviceRange.start - blend),
      "services-start": clamp(serviceRange.start + blend),
      "services-end": clamp(serviceRange.end - blend),
      "services-after": clamp(serviceRange.end + blend),
      "footer-before": clamp(footerRange.start - blend),
      "footer-start": clamp(footerRange.start + blend),
      "footer-end": 1,
    };

    gradients.forEach((gradient) => {
      gradient.querySelectorAll("[data-vine-tone-stop]").forEach((stop) => {
        const offset = offsets[stop.dataset.vineToneStop];
        if (typeof offset === "number") stop.setAttribute("offset", offset.toFixed(4));
      });
    });
  };

  const updateDrawing = () => {
    frame = 0;
    const storyTop = story.getBoundingClientRect().top + window.scrollY;
    const storyHeight = Math.max(1, story.offsetHeight);
    const advantageRect = advantages?.getBoundingClientRect();
    const vineOriginY = advantageRect
      ? advantageRect.top + window.scrollY - storyTop
      : window.innerHeight;
    const baseHeadRatio =
      window.innerWidth <= 620 ? MOBILE_HEAD_RATIO : DESKTOP_HEAD_RATIO;
    const activationScroll = Math.max(
      0,
      storyTop + vineOriginY - window.innerHeight * baseHeadRatio,
    );

    vine.dataset.activationScroll = Math.round(activationScroll).toString();
    if (window.scrollY <= activationScroll) {
      hideEverything();
      return;
    }

    const staticMode = prefersStatic();
    const travel = Math.max(1, storyHeight - window.innerHeight);
    const scrollWithinStory = clamp(window.scrollY - storyTop, 0, travel);
    const remaining = travel - scrollWithinStory;
    const finishDistance = Math.min(220, window.innerHeight * 0.24);
    const finishLinear = clamp(
      (finishDistance - remaining) / Math.max(1, finishDistance),
    );
    const finishBlend = finishLinear * finishLinear * (3 - 2 * finishLinear);
    const viewportHeadRatio =
      baseHeadRatio + (1 - baseHeadRatio) * finishBlend;
    const targetContentY = clamp(
      scrollWithinStory + window.innerHeight * viewportHeadRatio,
      0,
      storyHeight,
    );
    const activeSvg = getActiveSvg();
    const viewBoxHeight = activeSvg?.viewBox?.baseVal?.height || storyHeight;
    const targetSvgY = (targetContentY / storyHeight) * viewBoxHeight;
    const trackedProgress = progressAtY(getMainProfile(activeSvg), targetSvgY);
    const progress = staticMode ? 1 : trackedProgress;

    vine.dataset.vineState = staticMode ? "static" : "drawing";
    vine.style.setProperty("--vine-progress", progress.toFixed(4));
    vine.style.setProperty("--vine-head-ratio", viewportHeadRatio.toFixed(4));
    vine.style.setProperty("--vine-drift", "0px");
    mainStrokes.forEach((stroke) => setPathProgress(stroke, progress));

    branches.forEach((branch) => {
      const start = Number(branch.dataset.start || 0);
      const end = Number(branch.dataset.end || start + 0.08);
      const localProgress = clamp((progress - start) / Math.max(0.001, end - start));
      branch.dataset.progress = localProgress.toFixed(4);
      branch.style.visibility =
        localProgress > BRANCH_HEAD_GATE ? "visible" : "hidden";
      setPathProgress(branch, localProgress);
      branch.style.setProperty(
        "--segment-reveal",
        clamp(
          (localProgress - BRANCH_HEAD_GATE) / BRANCH_FADE_SPAN,
        ).toFixed(4),
      );
    });

    leaves.forEach((leaf) => {
      const branchId = leaf.dataset.vineLeafFor;
      const branch = branchId ? document.getElementById(branchId) : null;
      const branchProgress = branch?.classList.contains("home-scroll-vine__stroke--main")
        ? progress
        : Number(branch?.dataset.progress || 0);
      const node = clamp(Number(leaf.dataset.leafAt || 0.88), 0.12, 0.96);
      const delay = Number(leaf.dataset.leafDelay || 0);
      const followsMain = branch?.classList.contains(
        "home-scroll-vine__stroke--main",
      );
      const leafStart = clamp(node + LEAF_GAP + delay, 0, 0.982);
      const leafDuration = Number(
        leaf.dataset.leafDuration || LEAF_REVEAL_DURATION,
      );
      const leafProgress = clamp(
        (branchProgress - leafStart) / Math.max(0.02, leafDuration),
      );
      leaf.style.setProperty("--leaf-reveal", leafProgress.toFixed(4));
      leaf.style.visibility = leafProgress > 0.002 ? "visible" : "hidden";
    });

    mainStrokes.forEach((stroke) => {
      stroke.style.willChange =
        progress > 0.01 && progress < 0.99 ? "stroke-dashoffset" : "auto";
    });
  };

  const scheduleUpdate = () => {
    if (frame || document.hidden) return;
    frame = window.requestAnimationFrame(updateDrawing);
  };

  const resetMotionMode = () => {
    scheduleUpdate();
  };

  const updateLayout = () => {
    updateToneRanges();
    positionLeaves();
    scheduleUpdate();
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", updateLayout);
  window.addEventListener("load", updateLayout, { once: true });
  window.addEventListener("pageshow", updateLayout);
  document.addEventListener("visibilitychange", scheduleUpdate);
  reducedMotion.addEventListener?.("change", resetMotionMode);
  connection?.addEventListener?.("change", resetMotionMode);

  hideEverything();
  calibrateBranches();
  positionLeaves();
  updateToneRanges();
  resetMotionMode();
})();
