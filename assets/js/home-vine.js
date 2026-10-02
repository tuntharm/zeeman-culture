(() => {
  const story = document.querySelector('[data-home-story]');
  const vine = document.querySelector('[data-scroll-vine]');
  if (!story || !vine) return;
  const svg = vine.querySelector('svg');
  const stem = svg.querySelector('.home-scroll-vine__stroke--main');
  const strokes = [...svg.querySelectorAll('.home-scroll-vine__stroke')];
  const details = svg.querySelector('[data-vine-details]');
  const sections = ['advantages', 'services', 'cases', 'journal', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const NS = 'http://www.w3.org/2000/svg';
  // Original page-spanning composition; only its coordinates are calibrated to the current page.
  const routes = {
  "desktop": {
    "width": 1440,
    "height": 4000,
    "main": "M1440 1065C1424 1100 1400 1134 1382 1176C1358 1224 1334 1266 1318 1308C1300 1352 1314 1408 1354 1450C1398 1494 1432 1512 1424 1578C1432 1630 1434 1744 1388 1840C1368 1884 1370 1952 1408 2020C1434 2068 1420 2122 1388 2160C1348 2210 1310 2254 1286 2318C1262 2384 1298 2450 1360 2510C1422 2570 1426 2650 1388 2730C1348 2814 1288 2870 1266 2942C1244 3014 1292 3070 1360 3132C1424 3192 1432 3280 1398 3370C1368 3440 1324 3476 1288 3512C1244 3558 1268 3630 1330 3690C1392 3750 1424 3826 1410 3892C1398 3946 1420 3982 1440 4000",
    "branches": [
      {
        "d": "M1382 1176C1348 1132 1294 1112 1236 1128C1168 1146 1122 1198 1056 1192C992 1186 944 1146 882 1160C828 1172 784 1202 748 1238",
        "duration": 0.05,
        "light": false,
        "name": "vine-d-strategy-01"
      },
      {
        "d": "M1318 1308C1274 1274 1228 1258 1180 1268C1124 1280 1082 1312 1030 1306C980 1300 940 1274 892 1288",
        "duration": 0.048,
        "light": false,
        "name": "vine-d-strategy-02"
      },
      {
        "d": "M1354 1450C1388 1464 1412 1494 1416 1526C1420 1560 1402 1588 1370 1602C1346 1612 1324 1608 1304 1592",
        "duration": 0.046,
        "light": false,
        "name": "vine-d-strategy-03"
      },
      {
        "d": "M1388 2160C1350 2200 1310 2242 1268 2250C1216 2260 1176 2230 1134 2248C1090 2268 1052 2300 1008 2290",
        "duration": 0.044,
        "light": true,
        "name": "vine-d-services-01"
      },
      {
        "d": "M1360 2510C1318 2480 1276 2482 1244 2512C1208 2546 1172 2560 1128 2544C1090 2530 1052 2540 1018 2570",
        "duration": 0.044,
        "light": true,
        "name": "vine-d-services-02"
      },
      {
        "d": "M1266 2942C1218 2918 1170 2920 1128 2948C1086 2978 1046 2992 1002 2974C966 2960 930 2968 896 2996",
        "duration": 0.034,
        "light": false,
        "name": "vine-d-cases-01"
      },
      {
        "d": "M1288 3512C1218 3488 1140 3498 1066 3534C1002 3564 946 3566 894 3544",
        "duration": 0.048,
        "light": true,
        "name": "vine-d-footer-upper"
      },
      {
        "d": "M1330 3690C1388 3738 1424 3802 1448 3870C1468 3924 1466 3992 1438 4034C1180 4104 404 4106-30 4038C-56 4010-34 3980 24 3960C154 3916 272 3840 404 3796C520 3758 620 3770 708 3810C742 3826 770 3832 798 3818",
        "duration": 0.08,
        "light": true,
        "name": "vine-d-footer-return"
      }
    ]
  },
  "mobile": {
    "width": 390,
    "height": 4400,
    "main": "M390 820C384 880 376 940 366 1000C356 1060 350 1120 360 1180C372 1240 388 1300 384 1380C380 1500 374 1650 386 1770C390 1850 388 1930 384 1990C376 2100 366 2200 374 2320C380 2420 390 2500 386 2580C382 2700 372 2860 380 3000C388 3180 390 3420 386 3615C382 3720 374 3820 380 3940C386 4080 382 4240 356 4400",
    "branches": [
      {
        "d": "M366 1000C356 1000 346 1008 340 1020C334 1032 326 1038 316 1036",
        "duration": 0.044,
        "light": false,
        "name": "vine-m-strategy-01"
      },
      {
        "d": "M360 1180C350 1188 342 1200 340 1214C338 1228 330 1236 318 1238",
        "duration": 0.044,
        "light": false,
        "name": "vine-m-strategy-02"
      },
      {
        "d": "M384 1380C374 1372 364 1374 356 1384C348 1394 340 1398 330 1394",
        "duration": 0.044,
        "light": false,
        "name": "vine-m-strategy-03"
      },
      {
        "d": "M384 1990C374 2000 364 2006 352 2004C340 2002 330 2008 322 2018",
        "duration": 0.044,
        "light": true,
        "name": "vine-m-services-01"
      },
      {
        "d": "M374 2320C364 2312 354 2314 346 2324C338 2336 328 2340 316 2336",
        "duration": 0.044,
        "light": true,
        "name": "vine-m-services-02"
      },
      {
        "d": "M386 3615C374 3602 360 3604 348 3616C336 3628 324 3636 310 3634",
        "duration": 0.044,
        "light": true,
        "name": "vine-m-footer-01"
      },
      {
        "d": "M380 3940C368 3928 354 3930 342 3942C330 3954 318 3960 304 3956",
        "duration": 0.044,
        "light": true,
        "name": "vine-m-footer-02"
      },
      {
        "d": "M382 4240C370 4216 356 4198 340 4192C324 4186 310 4192 298 4204",
        "duration": 0.048,
        "light": true,
        "name": "vine-m-footer-03"
      },
      {
        "d": "M382 4240C370 4228 358 4210 352 4188C346 4164 334 4148 316 4138",
        "duration": 0.052,
        "light": true,
        "name": "vine-m-footer-04"
      }
    ]
  }
};
  const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, n));
  const staticMode = () => motion.matches || Boolean(connection?.saveData);
  let branches = [];
  let samples = [];
  let length = 0;
  let frame = 0;
  let layoutPending = true;
  let originY = 0;
  let height = 0;

  const element = (tag, attributes, parent = details) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    parent.append(node);
    return node;
  };
  const setProgress = (path, total, progress) => {
    path.style.strokeDasharray = `${total} ${total}`;
    path.style.strokeDashoffset = `${total * (1 - progress)}`;
    path.dataset.drawProgress = progress.toFixed(4);
  };
  const ratioAtY = y => {
    if (!samples.length || y <= samples[0].y) return 0;
    if (y >= samples.at(-1).y) return 1;
    let low = 0, high = samples.length - 1;
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      if (samples[middle].y < y) low = middle;
      else high = middle;
    }
    const mix = clamp((y - samples[low].y) / Math.max(0.01, samples[high].y - samples[low].y));
    return (low + mix) / (samples.length - 1);
  };

  const rebuild = () => {
    layoutPending = false;
    const storyRect = story.getBoundingClientRect();
    const width = story.clientWidth;
    height = storyRect.height;
    const mobile = width <= 620;
    const relativeY = el => {
      let top = 0;
      for (let node = el; node && node !== story; node = node.offsetParent) top += node.offsetTop;
      return top;
    };
    originY = relativeY(sections[0]) + 2;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    const route = mobile ? routes.mobile : routes.desktop;
    const journal = document.getElementById('journal');
    const journalTop = relativeY(journal);
    const journalHeight = journal.getBoundingClientRect().height;
    const formerHeight = height - journalHeight;
    const scaleX = width / route.width;
    const scaleY = formerHeight / route.height;
    const insertionY = journalTop / scaleY;
    const parse = source => {
      const values = source.match(/-?\d+(?:\.\d+)?/g).map(Number);
      const points = [];
      for (let i = 0; i < values.length; i += 2) points.push({ x: values[i], y: values[i + 1] });
      return points;
    };
    const map = (p, after = p.y >= insertionY) => ({ x: p.x * scaleX, y: p.y * scaleY + (after ? journalHeight : 0) });
    const pair = p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    const split = (p, curve, t) => {
      const a = lerp(p, curve[0], t), b = lerp(curve[0], curve[1], t), c = lerp(curve[1], curve[2], t);
      const d = lerp(a, b, t), e = lerp(b, c, t), join = lerp(d, e, t);
      return { left: [a, d, join], right: [e, c, curve[2]], join };
    };
    const points = parse(route.main);
    let d = `M${pair(map(points[0], false))}`;
    let previous = points[0];
    for (let i = 1; i < points.length; i += 3) {
      const curve = points.slice(i, i + 3);
      if (previous.y < insertionY && curve[2].y >= insertionY) {
        let low = 0, high = 1;
        for (let n = 0; n < 32; n++) {
          const t = (low + high) / 2;
          if (split(previous, curve, t).join.y < insertionY) low = t;
          else high = t;
        }
        const cut = split(previous, curve, (low + high) / 2);
        d += `C${cut.left.map(p => pair(map(p, false))).join(' ')}`;
        const from = map(cut.join, false), to = map(cut.join, true);
        const handle = (a, b) => {
          const dx = (a.x - b.x) * scaleX, dy = (a.y - b.y) * scaleY;
          const size = Math.min(120, journalHeight / 6) / Math.max(0.001, Math.hypot(dx, dy));
          return { x: dx * size, y: dy * size };
        };
        const entering = handle(cut.join, cut.left[1]);
        const leaving = handle(cut.right[0], cut.join);
        const middle = { x: width - (mobile ? 9 : 24), y: journalTop + journalHeight / 2 };
        d += `C${pair({ x: from.x + entering.x, y: from.y + entering.y })} ${pair({ x: middle.x, y: middle.y - journalHeight / 6 })} ${pair(middle)}`;
        d += `C${pair({ x: middle.x, y: middle.y + journalHeight / 6 })} ${pair({ x: to.x - leaving.x, y: to.y - leaving.y })} ${pair(to)}`;
        d += `C${cut.right.map(p => pair(map(p, true))).join(' ')}`;
      } else {
        const after = previous.y >= insertionY;
        d += `C${curve.map(p => pair(map(p, after))).join(' ')}`;
      }
      previous = curve[2];
    }
    strokes.forEach(path => path.setAttribute('d', d));
    length = stem.getTotalLength();
    samples = Array.from({ length: 1001 }, (_, i) => {
      const p = stem.getPointAtLength(length * i / 1000);
      return { x: p.x, y: p.y };
    });
    const gradient = svg.querySelector('[data-vine-gradient]');
    gradient.setAttribute('y2', height);
    const services = document.getElementById('services');
    const footer = document.getElementById('contact');
    const offsets = {
      base: 0,
      'services-before': (relativeY(services) - 2) / height,
      'services-start': (relativeY(services) + 2) / height,
      'services-end': (relativeY(services) + services.offsetHeight - 2) / height,
      'services-after': (relativeY(services) + services.offsetHeight + 2) / height,
      'footer-before': (relativeY(footer) - 2) / height,
      'footer-start': (relativeY(footer) + 2) / height,
      'footer-end': 1,
    };
    gradient.querySelectorAll('[data-vine-tone-stop]').forEach(stop => {
      stop.setAttribute('offset', clamp(offsets[stop.dataset.vineToneStop]));
    });
    // Protect the ink on each text line, rather than the whitespace in a whole heading/card.
    const protectedRects = [];
    const protect = r => {
      if (r.width > 0 && r.height > 0) protectedRects.push({
        left: r.left - 8, right: r.right + 8, top: r.top - 8, bottom: r.bottom + 8,
      });
    };
    const text = document.createTreeWalker(story, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = text.nextNode(); node; node = text.nextNode()) {
      const parent = node.parentElement;
      if (!node.textContent.trim() ||
          parent.closest('.hero, .sr-only, svg, script, style, [aria-hidden="true"]')) continue;
      range.selectNodeContents(node);
      const clip = parent.closest('.home-journal__rail, .brand-exchange__viewport')?.getBoundingClientRect();
      [...range.getClientRects()].forEach(r => {
        const left = clip ? Math.max(r.left, clip.left) : r.left;
        const right = clip ? Math.min(r.right, clip.right) : r.right;
        const top = clip ? Math.max(r.top, clip.top) : r.top;
        const bottom = clip ? Math.min(r.bottom, clip.bottom) : r.bottom;
        protect({ left, right, top, bottom, width: right - left, height: bottom - top });
      });
    }
    story.querySelectorAll('button, a.button').forEach(node => protect(node.getBoundingClientRect()));
    const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const placedLeafRects = [];
    const overlaps = box => box.left < storyRect.left + 4 || box.right > storyRect.right - 4 ||
      protectedRects.some(r => intersects(box, r)) || placedLeafRects.some(r => intersects(box, r));
    details.replaceChildren();
    branches = [];
    const branchRoutes = route.branches.map(branch => {
      const points = parse(branch.d);
      const after = points[0].y >= insertionY;
      return { ...branch, points: points.map(p => map(p, after)) };
    });
    // Continue the same broad branching rhythm above the new editorial section.
    const journalAnchor = stem.getPointAtLength(ratioAtY(journalTop + 25) * length);
    const reach = mobile ? 72 : width * 0.40;
    branchRoutes.push({ name: 'vine-journal', light: false, duration: 0.055, points: [journalAnchor,
      { x: journalAnchor.x - reach * 0.30, y: journalAnchor.y - 18 },
      { x: journalAnchor.x - reach * 0.68, y: journalAnchor.y + 20 },
      { x: journalAnchor.x - reach, y: journalAnchor.y + 2 }] });
    branchRoutes.forEach((branch, index) => {
      const sourceAnchor = branch.points[0];
      let nearest = 0, nearestDistance = Infinity;
      samples.forEach((point, i) => {
        const distance = (point.x - sourceAnchor.x) ** 2 + (point.y - sourceAnchor.y) ** 2;
        if (distance < nearestDistance) { nearest = i; nearestDistance = distance; }
      });
      const anchorDistance = length * nearest / (samples.length - 1);
      const anchor = stem.getPointAtLength(anchorDistance);
      const dx = anchor.x - sourceAnchor.x, dy = anchor.y - sourceAnchor.y;
      const mapped = branch.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
      let pathData = `M${pair(mapped[0])}`;
      for (let i = 1; i < mapped.length; i += 3) pathData += `C${mapped.slice(i, i + 3).map(pair).join(' ')}`;
      const dark = branch.light;
      const path = element('path', {
        class: `home-scroll-vine__branch${dark ? ' home-scroll-vine__branch--light' : ''}`,
        d: pathData, stroke: dark ? '#c7e0d1' : '#0f4a36',
        'data-anchor-x': anchor.x, 'data-anchor-y': anchor.y, 'data-vine-branch': branch.name,
      });
      const total = path.getTotalLength();
      const leafNodes = [];
      const returning = branch.name.includes('return');
      const count = returning ? 9 : clamp(Math.round(total / (mobile ? 24 : 105)), mobile ? 3 : 4, mobile ? 4 : 7);
      const rhythms = {
        3: [0.19, 0.52, 0.88], 4: [0.18, 0.39, 0.64, 0.88],
        5: [0.16, 0.34, 0.52, 0.70, 0.88], 6: [0.14, 0.26, 0.43, 0.57, 0.73, 0.89],
        7: [0.13, 0.23, 0.37, 0.49, 0.64, 0.77, 0.90],
      };
      const positions = returning ? Array.from({ length: count }, (_, i) => 0.70 + i * 0.24 / (count - 1)) : rhythms[count];
      positions.forEach((at, leafIndex) => {
        const angle = [38, -56, 45, -40, 58, -47, 34][leafIndex % 7];
        const scale = mobile ? [0.66, 0.60, 0.70, 0.63][leafIndex % 4] : [1.10, 0.95, 1.20, 1, 1.12, 0.92, 1][leafIndex % 7];
        const group = element('g', { class: `home-scroll-vine__leaf${dark ? ' home-scroll-vine__leaf--light' : ''}`,
          'data-vine-leaf': '', 'data-leaf-branch': branch.name,
        });
        element('path', { class: 'home-scroll-vine__leaf-petiole', d: 'M0 0Q4 -1 7 0' }, group);
        const attachment = element('g', { transform: 'translate(7 0)' }, group);
        const blade = element('g', { 'data-vine-leaf-blade': '' }, attachment);
        const shape = leafIndex === count - 1 ? 'bud' : ((leafIndex + index) % 2 ? 'narrow' : 'full');
        element('use', { href: `#vine-leaf-${shape}` }, blade);
        let accepted = false;
        for (const shift of [0, -0.035, 0.035, -0.07, 0.07]) {
          const candidate = clamp(at + shift, returning ? 0.70 : 0.10, returning ? 0.95 : 0.93);
          const distance = total * candidate;
          const node = path.getPointAtLength(distance);
          const before = path.getPointAtLength(Math.max(0, distance - 1));
          const after = path.getPointAtLength(Math.min(total, distance + 1));
          const tangent = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
          for (const side of [1, -1]) {
            group.setAttribute('transform', `translate(${node.x} ${node.y}) rotate(${tangent + angle * side}) scale(${scale})`);
            // Reserve the full movement envelope, including the blade's small unfolding rotation.
            const boxes = [0, -8, 8].map(rotation => {
              blade.setAttribute('transform', `rotate(${rotation})`);
              return group.getBoundingClientRect();
            });
            const box = {
              left: Math.min(...boxes.map(r => r.left)), right: Math.max(...boxes.map(r => r.right)),
              top: Math.min(...boxes.map(r => r.top)), bottom: Math.max(...boxes.map(r => r.bottom)),
            };
            if (overlaps(box)) continue;
            blade.setAttribute('transform', 'rotate(0) scale(1)');
            group.dataset.leafAt = candidate;
            group.dataset.anchorX = node.x;
            group.dataset.anchorY = node.y;
            placedLeafRects.push({ left: box.left - 2, right: box.right + 2, top: box.top - 2, bottom: box.bottom + 2 });
            leafNodes.push({ group, blade, at: candidate, turn: angle * side > 0 ? -8 : 8,
              clearance: Math.min(0.08, 8 / total, (1 - candidate) / 2) });
            accepted = true;
            break;
          }
          if (accepted) break;
        }
        if (!accepted) group.remove();
      });
      const start = clamp(anchorDistance / length + 12 / length, 0, 0.98);
      branches.push({ path, total, start, end: Math.min(1, start + branch.duration), leaves: leafNodes });
    });
    vine.dataset.geometryWidth = width;
    vine.dataset.geometryHeight = height;
    document.documentElement.classList.add('vine-ready');
  };

  const draw = () => {
    const storyTop = story.getBoundingClientRect().top + scrollY;
    const travel = Math.max(1, height - innerHeight);
    const remaining = travel - Math.max(0, scrollY - storyTop);
    const finish = clamp(1 - remaining / Math.min(220, innerHeight * 0.24));
    const head = innerHeight * (0.62 + 0.38 * finish * finish * (3 - 2 * finish));
    const targetY = scrollY - storyTop + head;
    const atEnd = scrollY - storyTop >= travel - 1;
    const progress = staticMode() || atEnd ? 1 : ratioAtY(targetY);
    vine.dataset.vineState = staticMode() ? 'static' : (progress > 0 ? 'drawing' : 'ready');
    vine.dataset.drawProgress = progress.toFixed(4);
    strokes.forEach(path => setProgress(path, length, progress));
    branches.forEach(branch => {
      const local = staticMode() ? 1 : clamp((progress - branch.start) / Math.max(0.001, branch.end - branch.start));
      setProgress(branch.path, branch.total, local);
      branch.path.style.opacity = local > 0 ? '0.8' : '0';
      branch.leaves.forEach(leaf => {
        const start = leaf.at + leaf.clearance;
        const reveal = staticMode() ? 1 : clamp((local - start) / Math.min(0.08, Math.max(0.02, 1 - start)));
        const eased = reveal * reveal * (3 - 2 * reveal);
        leaf.group.style.opacity = (eased * 0.9).toFixed(3);
        leaf.group.style.visibility = reveal > 0 ? 'visible' : 'hidden';
        leaf.blade.setAttribute('transform', `rotate(${(leaf.turn * (1 - eased)).toFixed(2)}) scale(${(0.75 + 0.25 * eased).toFixed(3)})`);
        leaf.group.dataset.revealProgress = reveal.toFixed(4);
      });
    });
  };
  const update = () => {
    frame = 0;
    if (layoutPending) rebuild();
    draw();
  };
  const schedule = (layout = false) => {
    layoutPending ||= layout;
    if (!frame) frame = requestAnimationFrame(update);
  };
  addEventListener('scroll', () => schedule(), { passive: true });
  addEventListener('resize', () => schedule(true));
  addEventListener('load', () => schedule(true), { once: true });
  addEventListener('pageshow', () => schedule(true));
  story.addEventListener('transitionend', event => {
    if (event.propertyName === 'transform' && event.target.matches('.reveal')) schedule(true);
  });
  motion.addEventListener?.('change', () => schedule());
  connection?.addEventListener?.('change', () => schedule());
  document.fonts?.ready.then(() => schedule(true));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => schedule(true));
    observer.observe(story);
    sections.forEach(section => observer.observe(section));
  }
  schedule(true);
})();
