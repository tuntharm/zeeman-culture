(() => {
  const story = document.querySelector('[data-home-story]');
  const vine = document.querySelector('[data-scroll-vine]');
  if (!story || !vine) return;
  const svg = vine.querySelector('svg');
  const stem = svg.querySelector('.home-scroll-vine__stroke--main');
  const strokes = [...svg.querySelectorAll('.home-scroll-vine__stroke')];
  const details = svg.querySelector('[data-vine-details]');
  const sections = ['advantages', 'services', 'cases', 'founders', 'journal', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const NS = 'http://www.w3.org/2000/svg';
  // Original page-spanning composition; only its coordinates are calibrated to the current page.
  const routes = {
  "desktop": {
    "width": 1440,
    "height": 4000,
    "main": "M1440 1065C1424 1100 1400 1134 1382 1176C1358 1224 1334 1266 1318 1308C1300 1352 1314 1408 1354 1450C1398 1494 1432 1512 1424 1578C1432 1630 1434 1744 1388 1840C1368 1884 1370 1952 1408 2020C1434 2068 1420 2122 1388 2160C1348 2210 1310 2254 1286 2318C1262 2384 1298 2450 1360 2510C1422 2570 1426 2650 1388 2730C1348 2814 1288 2870 1266 2942C1244 3014 1292 3070 1360 3132C1424 3192 1432 3280 1398 3370C1368 3440 1324 3476 1288 3512C1244 3558 1268 3630 1330 3690C1392 3750 1424 3800 1408 3858",
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
    "main": "M390 820C384 880 376 940 366 1000C356 1060 350 1120 360 1180C372 1240 388 1300 384 1380C380 1500 374 1650 386 1770C390 1850 388 1930 384 1990C376 2100 366 2200 374 2320C380 2420 390 2500 386 2580C382 2700 372 2860 380 3000C388 3180 390 3420 386 3615C382 3720 374 3820 380 3940C386 4080 384 4170 378 4232",
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
  let reach = [];
  // Tone gradients share the stem gradient's section stops: dark ink on the
  // ivory sections, light green on the dark green bands.
  const inkGradient = svg.querySelector('[data-vine-gradient]');
  const tone = (id, canvas, band) => {
    const gradient = inkGradient.cloneNode(true);
    gradient.id = id;
    gradient.querySelectorAll('stop').forEach(stop => {
      stop.setAttribute('stop-color', stop.getAttribute('stop-color') === '#0f4a36' ? canvas : band);
    });
    inkGradient.after(gradient);
  };
  tone('vine-outline', '#0f4a36', '#dcebdc');
  tone('vine-fill', '#b9d5c2', '#cfe3d1');
  tone('vine-shade', '#2f6b4f', '#5c8a6f');
  tone('vine-glint', '#ffffff', '#f4f8ef');
  const layerGroup = className => {
    const node = document.createElementNS(NS, 'g');
    node.setAttribute('class', className);
    details.before(node);
    return node;
  };
  // Branches sit under the stem so their roots disappear into it.
  const branchLayer = layerGroup('home-scroll-vine__branches');
  const stemLayer = layerGroup('home-scroll-vine__trunk');
  let stemNormals = [];
  let stemWidths = [];
  let stemTube = null;
  let stemLeaves = [];
  let tendrils = [];
  let finalLeaf = null;
  // Every vine piece is a shaded tube: a light-green body with an inked edge,
  // two bands of shade on the side away from the light and a fine highlight.
  const makeTube = (parent, points, widths) => {
    const layer = (name, paint) => {
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('class', `home-scroll-vine__tube-${name}`);
      Object.entries(paint).forEach(([key, value]) => path.setAttribute(key, value));
      parent.append(path);
      return path;
    };
    const normals = points.map((p, i) => {
      const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
      const size = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return { x: -(b.y - a.y) / size, y: (b.x - a.x) / size };
    });
    // Light comes from the upper left; the highlight faces it.
    const facing = normals.reduce((sum, n) => sum - 0.45 * n.x - 0.9 * n.y, 0) >= 0 ? 1 : -1;
    return {
      points, widths, drawn: -1,
      normals: normals.map(n => ({ x: n.x * facing, y: n.y * facing })),
      body: layer('body', { fill: 'url(#vine-fill)', stroke: 'url(#vine-outline)' }),
      shade: layer('shade', { fill: 'url(#vine-shade)' }),
      deep: layer('deep', { fill: 'url(#vine-shade)' }),
      glint: layer('glint', { fill: 'none', stroke: 'url(#vine-glint)' }),
    };
  };
  const renderTube = (tube, progress) => {
    const count = tube.points.length;
    let last = Math.round(clamp(progress) * (count - 1));
    if (tube.ratios) {
      // Unevenly spaced points: find the last one the drawing has reached.
      let low = 0, high = count - 1;
      while (low < high) {
        const middle = (low + high + 1) >> 1;
        if (tube.ratios[middle] <= progress) low = middle;
        else high = middle - 1;
      }
      last = low;
    }
    if (last === tube.drawn) return;
    tube.drawn = last;
    const layers = [tube.body, tube.shade, tube.deep, tube.glint];
    if (last < 2) { layers.forEach(path => path.removeAttribute('d')); return; }
    const lit = [], dark = [], shadeEdge = [], inner = [], deepEdge = [], glint = [];
    const at = (p, n, k) => `${(p.x + n.x * k).toFixed(1)} ${(p.y + n.y * k).toFixed(1)}`;
    for (let i = 0; i <= last; i++) {
      // A growing tip while drawing; finished pieces keep their own taper.
      const gap = tube.ratios ? (tube.ratios[last] - tube.ratios[i]) * tube.length / 6 : last - i;
      const tip = progress >= 1 ? 1 : Math.min(1, 0.2 + gap / 16);
      const w = tube.widths[i] * tip, p = tube.points[i], n = tube.normals[i];
      lit.push(at(p, n, w));
      dark.push(at(p, n, -w));
      shadeEdge.push(at(p, n, w * 0.05));
      inner.push(at(p, n, -w * 0.86));
      deepEdge.push(at(p, n, -w * 0.4));
      glint.push(at(p, n, w * 0.48));
    }
    const ring = (a, b) => `M${a.join('L')}L${b.reverse().join('L')}Z`;
    tube.body.setAttribute('d', ring(lit, dark));
    tube.shade.setAttribute('d', ring(shadeEdge, [...inner]));
    tube.deep.setAttribute('d', ring(deepEdge, inner));
    tube.glint.setAttribute('d', `M${glint.join('L')}`);
  };

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
    // Search the running lowest point, so the closing loop cannot confuse it.
    if (!reach.length || y <= reach[0]) return 0;
    if (y >= reach.at(-1)) return 1;
    let low = 0, high = reach.length - 1;
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      if (reach[middle] < y) low = middle;
      else high = middle;
    }
    const mix = clamp((y - reach[low]) / Math.max(0.01, reach[high] - reach[low]));
    return (low + mix) / (samples.length - 1);
  };

  const rebuild = () => {
    layoutPending = false;
    const storyRect = story.getBoundingClientRect();
    const width = story.clientWidth;
    height = storyRect.height;
    const mobile = width <= 620;
    const tablet = width > 620 && width <= 820;
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
    const journalTop = journal ? relativeY(journal) : height;
    const journalHeight = journal ? journal.getBoundingClientRect().height : 0;
    const formerHeight = height - journalHeight;
    const scaleX = width / route.width;
    const scaleY = formerHeight / route.height;
    const insertionY = journal ? journalTop / scaleY : Infinity;
    // With Journal paused, attach the original route to the overview page's
    // real sections so it starts below the hero and reaches the footer.
    const compactAnchors = [
      [mobile ? 820 : 1065, relativeY(document.getElementById('advantages'))],
      [mobile ? 1770 : 1840, relativeY(document.getElementById('services'))],
      [mobile ? 2580 : 2730, relativeY(document.getElementById('cases') || document.getElementById('contact'))],
      [mobile ? 3000 : 3132, relativeY(document.getElementById('founders') || document.getElementById('contact'))],
      [mobile ? 3615 : 3512, relativeY(document.getElementById('contact'))],
      [route.height, height],
    ];
    const compactY = y => {
      const index = compactAnchors.findIndex((anchor, i) => i > 0 && y <= anchor[0]);
      const end = index < 0 ? compactAnchors.length - 1 : index;
      const [a, b] = [compactAnchors[end - 1], compactAnchors[end]];
      return a[1] + (y - a[0]) / (b[0] - a[0]) * (b[1] - a[1]);
    };
    const parse = source => {
      const values = source.match(/-?\d+(?:\.\d+)?/g).map(Number);
      const points = [];
      for (let i = 0; i < values.length; i += 2) points.push({ x: values[i], y: values[i + 1] });
      return points;
    };
    // Keep a flowing Services curve, easing back to the outer gutter before case cards.
    const servicePull = y => {
      const t = clamp((y - 2510) / 220);
      const minimum = width <= 1100 ? 0.82 : 0.55;
      return minimum + (1 - minimum) * t * t * (3 - 2 * t);
    };
    // Keep the original bends in the real space beside cards and portraits.
    // A full edge pull flattens every control point into one vertical line.
    const overviewGutter = Math.min(...['.home-cases__rail', '.home-founders__grid'].map(selector => {
      const node = story.querySelector(selector);
      return node ? width - (node.getBoundingClientRect().right - storyRect.left) : width;
    }));
    const nearEdge = mobile ? 7 : 10;
    const farEdge = Math.max(nearEdge, Math.min(mobile ? 32 : 64,
      overviewGutter - (mobile ? 4.5 : 9) - 4));
    const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
    const map = (p, after = p.y >= insertionY) => {
      // Leave room for the narrower right-hand tablet column. Ease back into
      // the original route below the introduction rather than bending the stem.
      const baseX = p.x * scaleX + (tablet ? 40 * clamp((1840 - p.y) / 238) : 0)
        + (!journal && mobile ? (width - 5 - p.x * scaleX) * Math.min(clamp((p.y - 2320) / 260), clamp((3940 - p.y) / 325)) : 0)
        + (!journal && !mobile ? (width - 12 - p.x * scaleX)
          * Math.min(clamp((p.y - 1840) / 180), clamp((3690 - p.y) / 178)) * servicePull(p.y) : 0);
      const weight = journal ? 0 : ease((p.y - (compactAnchors[2][0] - 180)) / 180)
        * ease((compactAnchors[4][0] + 180 - p.y) / 180);
      const chapter = p.y < compactAnchors[3][0] ? 2 : 3;
      const phase = clamp((p.y - compactAnchors[chapter][0])
        / (compactAnchors[chapter + 1][0] - compactAnchors[chapter][0]));
      const bend = (1 - Math.cos(2 * Math.PI * phase)) / 2;
      const curveX = width - (nearEdge + (farEdge - nearEdge) * bend);
      return {
        x: baseX + (curveX - baseX) * weight,
        y: journal ? p.y * scaleY + (after ? journalHeight : 0) : compactY(p.y),
      };
    };
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
    let joint = null;
    for (let i = 1; i < points.length; i += 3) {
      const curve = points.slice(i, i + 3);
      if (!journal && previous.y >= compactAnchors[2][0] && previous.y < compactAnchors[4][0]) {
        if (previous.y === compactAnchors[2][0]) {
          // Two gentle bows share vertical tangents at every join. Mapping the
          // old control points independently can introduce sharp corners.
          for (const chapter of [2, 3]) {
            const top = compactAnchors[chapter][1];
            const bottom = compactAnchors[chapter + 1][1];
            const middle = (top + bottom) / 2;
            const outside = width - nearEdge, inside = width - farEdge;
            d += `C${pair({ x: outside, y: top + (middle - top) / 2 })} ${pair({ x: inside, y: middle - (middle - top) / 2 })} ${pair({ x: inside, y: middle })}`;
            d += `C${pair({ x: inside, y: middle + (bottom - middle) / 2 })} ${pair({ x: outside, y: bottom - (bottom - middle) / 2 })} ${pair({ x: outside, y: bottom })}`;
          }
        }
        joint = null;
      } else if (previous.y < insertionY && curve[2].y >= insertionY) {
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
        joint = null;
      } else {
        const after = previous.y >= insertionY;
        const mapped = curve.map(p => map(p, after));
        if (!journal && curve[2].y === compactAnchors[2][0]) mapped[1].x = mapped[2].x;
        if (!journal && previous.y === compactAnchors[4][0]) mapped[0].x = map(previous).x;
        else if (joint) {
          // Neighbouring control points are mapped differently; keep each join
          // smooth so the shaded stem never shows a corner.
          const handle = Math.hypot(mapped[0].x - joint.end.x, mapped[0].y - joint.end.y);
          const dx = joint.end.x - joint.control.x, dy = joint.end.y - joint.control.y;
          const size = Math.hypot(dx, dy) || 1;
          mapped[0] = { x: joint.end.x + dx / size * handle, y: joint.end.y + dy / size * handle };
        }
        d += `C${mapped.map(pair).join(' ')}`;
        joint = { control: mapped[1], end: mapped[2] };
      }
      previous = curve[2];
    }
    // Finish as in the footer sketch: a small loop, an S-shaped tail and a
    // hanging leaf, all inside the footer.
    stem.setAttribute('d', d);
    const routeEnd = stem.getTotalLength();
    const end = stem.getPointAtLength(routeEnd), before = stem.getPointAtLength(routeEnd - 2);
    const endSize = Math.hypot(end.x - before.x, end.y - before.y) || 1;
    const forward = { x: (end.x - before.x) / endSize, y: (end.y - before.y) / endSize };
    let inward = { x: -forward.y, y: forward.x };
    if (inward.x * (width / 2 - end.x) < 0) inward = { x: -inward.x, y: -inward.y };
    const room = height - 14 - end.y;
    const unit = Math.min(mobile ? 0.62 : 1, Math.max(0.5, room / 115));
    const loopAdvance = 5 * unit, loopRadius = 16 * unit;
    const finish = [];
    for (let i = 1; i <= 48; i++) {
      const theta = Math.PI + 2 * Math.PI * i / 48;
      const along = loopAdvance * (theta - Math.PI) - loopRadius * Math.sin(theta);
      const across = loopRadius * (1 + Math.cos(theta));
      finish.push({ x: end.x + forward.x * along + inward.x * across, y: end.y + forward.y * along + inward.y * across });
    }
    const tailStart = finish.at(-1);
    // The tail swings outward, so the last leaf hangs away from the text,
    // unless the stem already runs along the page edge.
    const outwardRoom = end.x > width / 2 ? width - end.x : end.x;
    const swing = outwardRoom > 26 ? -1 : 1;
    for (let i = 1; i <= 20; i++) {
      const t = i / 20, along = 42 * unit * t, across = swing * 11 * unit * (1 - Math.cos(Math.PI * t / 2));
      finish.push({ x: tailStart.x + forward.x * along + inward.x * across, y: tailStart.y + forward.y * along + inward.y * across });
    }
    d += finish.map(p => `L${pair(p)}`).join('');
    strokes.forEach(path => path.setAttribute('d', d));
    length = stem.getTotalLength();
    samples = Array.from({ length: 1001 }, (_, i) => {
      const p = stem.getPointAtLength(length * i / 1000);
      return { x: p.x, y: p.y };
    });
    let lowest = -Infinity;
    reach = samples.map(p => (lowest = Math.max(lowest, p.y)));
    // Brush width: a tilted nib swells near-vertical strokes and thins the
    // diagonals, a slow pressure swell varies it further; both ends taper.
    const [thin, thick] = mobile ? [1.7, 3.1] : [2.6, 4.9];
    const nibAngle = 0.42;
    const rawWidths = samples.map((point, i) => {
      const a = samples[Math.max(0, i - 3)], b = samples[Math.min(samples.length - 1, i + 3)];
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const t = i / (samples.length - 1);
      const nib = Math.abs(Math.sin(angle - nibAngle));
      const pressure = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * (mobile ? 5 : 7) + 1.3);
      const taper = Math.min(1, length * t / 40) * (0.22 + 0.78 * ease(length * (1 - t) / (mobile ? 55 : 80)));
      return (thin + (thick - thin) * clamp(0.6 * nib * nib + 0.4 * pressure)) * taper;
    });
    stemWidths = rawWidths.map((_, i) => {
      let sum = 0, count = 0;
      for (let j = Math.max(0, i - 8); j <= Math.min(rawWidths.length - 1, i + 8); j++) { sum += rawWidths[j]; count++; }
      return sum / count;
    });
    stemNormals = samples.map((point, i) => {
      const a = samples[Math.max(0, i - 1)], b = samples[Math.min(samples.length - 1, i + 1)];
      const size = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return { x: -(b.y - a.y) / size, y: (b.x - a.x) / size };
    });
    // The tube follows the stem samples, but traces the closing loop finely.
    const tubePoints = [], tubeRatios = [];
    samples.forEach((p, i) => {
      if (i / 1000 * length < routeEnd) { tubePoints.push(p); tubeRatios.push(i / 1000); }
    });
    for (let distance = routeEnd; distance < length + 1.2; distance += 1.2) {
      const p = stem.getPointAtLength(Math.min(length, distance));
      tubePoints.push({ x: p.x, y: p.y });
      tubeRatios.push(Math.min(1, distance / length));
    }
    const tubeWidths = tubeRatios.map(ratio => {
      const f = ratio * 1000, i = Math.min(999, Math.floor(f)), t = f - i;
      return stemWidths[i] * (1 - t) + stemWidths[i + 1] * t;
    });
    stemLayer.replaceChildren();
    stemTube = makeTube(stemLayer, tubePoints, tubeWidths);
    stemTube.ratios = tubeRatios;
    stemTube.length = length;
    const gradient = svg.querySelector('[data-vine-gradient]');
    svg.querySelectorAll('[data-vine-gradient]').forEach(node => node.setAttribute('y2', height));
    const services = document.getElementById('services');
    const footer = document.getElementById('contact');
    // A short blend where the vine crosses between ivory and green sections.
    const blend = mobile ? 12 : 18;
    const offsets = {
      base: 0,
      'services-before': (relativeY(services) - blend) / height,
      'services-start': (relativeY(services) + blend) / height,
      'services-end': (relativeY(services) + services.offsetHeight - blend) / height,
      'services-after': (relativeY(services) + services.offsetHeight + blend) / height,
      'footer-before': (relativeY(footer) - blend) / height,
      'footer-start': (relativeY(footer) + blend) / height,
      'footer-end': 1,
    };
    svg.querySelectorAll('[data-vine-tone-stop]').forEach(stop => {
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
      const clip = parent.closest('.home-journal__rail, .home-cases__rail, .brand-lane__viewport')?.getBoundingClientRect();
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
    // A smooth y(x) through a few layout points (monotone cubic, so it only
    // turns where a point is a peak), sampled every few pixels.
    const footerSweep = tipSource => {
      const grid = footer.querySelector('.footer-grid');
      const brandColumn = grid?.firstElementChild;
      const bottomRow = footer.querySelector('.footer-bottom');
      const links = footer.querySelector('.footer-links');
      if (!brandColumn || !bottomRow || !links) return null;
      const box = node => {
        const r = node.getBoundingClientRect();
        return { left: r.left - storyRect.left, right: r.right - storyRect.left, top: r.top - storyRect.top, bottom: r.bottom - storyRect.top };
      };
      const brand = { left: Infinity, right: -Infinity, bottom: -Infinity };
      const walker = document.createTreeWalker(brandColumn, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent.trim()) continue;
        range.selectNodeContents(node);
        [...range.getClientRects()].forEach(r => {
          brand.left = Math.min(brand.left, r.left - storyRect.left);
          brand.right = Math.max(brand.right, r.right - storyRect.left);
          brand.bottom = Math.max(brand.bottom, r.bottom - storyRect.top);
        });
      }
      const rule = box(bottomRow).top, linksLeft = box(links).left, gridTop = box(grid).top;
      // Needs a real gap under the copy and open space before the links.
      if (!(rule - brand.bottom > 22) || linksLeft - brand.right < 160) return null;
      // Under the copy the branch is already climbing: low by the left edge,
      // just under the last line at the right, continuing the same rise
      // back to the page edge, so the whole sweep reads as one S-curve.
      const low = { x: Math.max(-4, brand.left - 8), y: rule - 6 };
      const under = { x: brand.right + 24, y: brand.bottom + 6 };
      const rise = (low.y - under.y) / (under.x - low.x);
      const tip = { x: Math.min(tipSource.x, linksLeft - 56), y: tipSource.y };
      // Keep the crest gentle when the open space is narrow: climb at most
      // half a pixel per pixel, and let the tip fall back no more steeply.
      const crestX = under.x + 0.55 * (tip.x - under.x);
      const crest = { x: crestX, y: Math.min(tip.y - 18, Math.max(gridTop + 10, under.y - 0.5 * (crestX - under.x))) };
      tip.y = Math.min(tip.y, crest.y + 0.45 * (tip.x - crest.x));
      const knots = [
        { x: -24, y: Math.min(height - 10, low.y + rise * (low.x + 24)) },
        low, under, crest, tip,
      ];
      if (knots.some((k, i) => i && k.x <= knots[i - 1].x + 8)) return null;
      const n = knots.length, h = [], slope = [], m = [];
      for (let i = 0; i < n - 1; i++) {
        h[i] = knots[i + 1].x - knots[i].x;
        slope[i] = (knots[i + 1].y - knots[i].y) / h[i];
      }
      m[0] = slope[0];
      m[n - 1] = slope[n - 2];
      for (let i = 1; i < n - 1; i++) {
        const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
        m[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
      }
      const points = [];
      for (let i = 0; i < n - 1; i++) {
        const steps = Math.max(2, Math.round(h[i] / 3));
        for (let k = i ? 1 : 0; k <= steps; k++) {
          const t = k / steps, t2 = t * t, t3 = t2 * t;
          points.push({ x: knots[i].x + h[i] * t,
            y: (2 * t3 - 3 * t2 + 1) * knots[i].y + (t3 - 2 * t2 + t) * h[i] * m[i]
              + (-2 * t3 + 3 * t2) * knots[i + 1].y + (t3 - t2) * h[i] * m[i + 1] });
        }
      }
      return points;
    };
    details.replaceChildren();
    branchLayer.replaceChildren();
    branches = [];
    const branchRoutes = route.branches.map(branch => {
      const points = parse(branch.d);
      const after = points[0].y >= insertionY;
      let mapped = points.map(p => map(p, after));
      if ((tablet && branch.name.includes('strategy')) || (!journal && (branch.name.includes('services') || branch.name.includes('cases')))) {
        const anchor = mapped[0];
        // Short, proportionate sprigs leave the tablet and service-card text clear.
        const size = branch.name.includes('cases') ? 0.045 : (mobile ? 0.4 : 0.25);
        mapped = mapped.map(p => ({ x: anchor.x + (p.x - anchor.x) * size,
          y: anchor.y + (p.y - anchor.y) * size }));
      }
      return { ...branch, points: mapped };
    });
    // Continue the same broad branching rhythm above the new editorial section.
    if (journal) {
    const journalAnchor = stem.getPointAtLength(ratioAtY(journalTop + 25) * length);
    const reach = mobile ? 72 : width * 0.40;
    branchRoutes.push({ name: 'vine-journal', light: false, duration: 0.055, points: [journalAnchor,
      { x: journalAnchor.x - reach * 0.30, y: journalAnchor.y - 18 },
      { x: journalAnchor.x - reach * 0.68, y: journalAnchor.y + 20 },
      { x: journalAnchor.x - reach, y: journalAnchor.y + 2 }] });
    }
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
      let total = path.getTotalLength();
      const leafNodes = [];
      const returning = branch.name.includes('return');
      // The visible branch: as thick as the stem allows at its root, fine at
      // the tip, finishing in a small curl like the sketch.
      let segments = Math.max(8, Math.round(total / (mobile ? 2.5 : 3)));
      const tubePoints = Array.from({ length: segments + 1 }, (_, i) => {
        const p = path.getPointAtLength(total * i / segments);
        return { x: p.x, y: p.y };
      });
      // The footer sweep is rebuilt from the footer's own layout as one smooth
      // rise: in from the lower left, through the gap between the brand copy
      // and the copyright line, up to a crest in the open middle, then easing
      // down to the tip. It never crosses text and never wavers.
      // Where the footer columns leave no open space for it, the sweep is left
      // out rather than drawn across the copy.
      if (returning) {
        const sweep = footerSweep(tubePoints.at(-1));
        if (!sweep) { path.remove(); return; }
        tubePoints.splice(0, tubePoints.length, ...sweep);
        segments = tubePoints.length - 1;
        path.setAttribute('d', `M${tubePoints.map(pair).join('L')}`);
        total = path.getTotalLength();
      }
      // A branch's tip stops short of any text in its last stretch and curls
      // there instead.
      const blocked = tubePoints.findIndex((p, i) => i > 0.6 * segments && protectedRects.some(r => {
        const x = p.x + storyRect.left, y = p.y + storyRect.top;
        return x > r.left && x < r.right && y > r.top && y < r.bottom;
      }));
      if (blocked > 0) tubePoints.length = Math.max(8, blocked - 2);
      const reachAt = (tubePoints.length - 1) / segments;
      if (total * reachAt > 60) {
        const tipEnd = tubePoints.at(-1), tipBefore = tubePoints.at(-3);
        const size = Math.hypot(tipEnd.x - tipBefore.x, tipEnd.y - tipBefore.y) || 1;
        const along = { x: (tipEnd.x - tipBefore.x) / size, y: (tipEnd.y - tipBefore.y) / size };
        let up = { x: -along.y, y: along.x };
        if (up.y > 0) up = { x: -up.x, y: -up.y };
        const radius = mobile ? 3.5 : 6;
        const center = { x: tipEnd.x + up.x * radius, y: tipEnd.y + up.y * radius };
        const start = Math.atan2(tipEnd.y - center.y, tipEnd.x - center.x);
        const turn = along.x * up.y - along.y * up.x > 0 ? 1 : -1;
        for (let i = 1; i <= 14; i++) {
          const angle = start + turn * Math.PI * 1.25 * i / 14, r = radius * (1 - 0.35 * i / 14);
          tubePoints.push({ x: center.x + Math.cos(angle) * r, y: center.y + Math.sin(angle) * r });
        }
      }
      const baseWidth = Math.min(stemWidths[nearest] * 0.72, 0.9 + total * 0.02);
      const tubeWidths = tubePoints.map((p, i) => 0.45 + (baseWidth - 0.45) * Math.pow(1 - i / Math.max(1, tubePoints.length - 1), 0.85));
      const tube = makeTube(branchLayer, tubePoints, tubeWidths);
      tube.to = reachAt;
      const count = returning ? 9 : clamp(Math.round(total / (mobile ? 24 : 105)), mobile ? 3 : 4, mobile ? 4 : 7);
      const rhythms = {
        3: [0.19, 0.52, 0.88], 4: [0.18, 0.39, 0.64, 0.88],
        5: [0.16, 0.34, 0.52, 0.70, 0.88], 6: [0.14, 0.26, 0.43, 0.57, 0.73, 0.89],
        7: [0.13, 0.23, 0.37, 0.49, 0.64, 0.77, 0.90],
      };
      const leafFrom = 0.1;
      const positions = returning ? Array.from({ length: count }, (_, i) => leafFrom + (0.94 - leafFrom) * i / (count - 1)) : rhythms[count];
      positions.forEach((at, leafIndex) => {
        if (at > reachAt - 0.03) return;
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
          const candidate = clamp(at + shift, leafFrom, Math.min(returning ? 0.95 : 0.93, reachAt - 0.03));
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
      branches.push({ path, total, tube, start, end: Math.min(1, start + branch.duration), leaves: leafNodes });
    });
    // Leaves and curled tendrils straight off the stem, as in the hand-drawn
    // footer reference: alternating sides, kept clear of text like branch leaves.
    stemLeaves = [];
    tendrils = [];
    const servicesTop = relativeY(services), servicesBottom = servicesTop + services.offsetHeight;
    const footerTop = relativeY(footer);
    const onDark = y => (y > servicesTop && y < servicesBottom) || y > footerTop;
    const pointAt = ratio => {
      const i = Math.round(clamp(ratio) * (samples.length - 1));
      const a = samples[Math.max(0, i - 2)], b = samples[Math.min(samples.length - 1, i + 2)];
      return { ...samples[i], tangent: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI,
        normal: stemNormals[i], width: stemWidths[i] };
    };
    const claim = node => {
      const r = node.getBoundingClientRect();
      const box = { left: r.left - 2, right: r.right + 2, top: r.top - 2, bottom: r.bottom + 2 };
      if (overlaps(box)) return false;
      placedLeafRects.push(box);
      return true;
    };
    (mobile ? [0.22, 0.47, 0.72, 0.95] : [0.17, 0.36, 0.55, 0.74, 0.93]).forEach((at, k) => {
      const point = pointAt(at);
      const size = mobile ? 0.65 : 1;
      for (const side of k % 2 ? [1, -1] : [-1, 1]) {
        const out = { x: point.normal.x * side, y: point.normal.y * side };
        const start = { x: point.x + out.x * point.width, y: point.y + out.y * point.width };
        const heading = Math.atan2(out.y, out.x) - side * 0.6;
        const reach = 18 * size, radius = 8 * size;
        const points = Array.from({ length: 9 }, (_, i) => ({
          x: start.x + Math.cos(heading) * reach * i / 8,
          y: start.y + Math.sin(heading) * reach * i / 8 - Math.sin(Math.PI * i / 8) * 2 * size,
        }));
        // A tightening spiral that leaves the run along its own tangent.
        const end = points.at(-1);
        const center = { x: end.x + Math.cos(heading + side * Math.PI / 2) * radius,
          y: end.y + Math.sin(heading + side * Math.PI / 2) * radius };
        const from = heading - side * Math.PI / 2;
        for (let i = 1; i <= 36; i++) {
          const t = i / 36, theta = from + side * t * Math.PI * 2.15, r = radius * (1 - 0.7 * t);
          points.push({ x: center.x + Math.cos(theta) * r, y: center.y + Math.sin(theta) * r });
        }
        const path = element('path', { class: `home-scroll-vine__tendril${onDark(point.y) ? ' home-scroll-vine__tendril--light' : ''}`,
          d: `M${points.map(pair).join('L')}` });
        if (!claim(path)) { path.remove(); continue; }
        tendrils.push({ path, total: path.getTotalLength(), at });
        break;
      }
    });
    const leafCount = Math.floor(length / (mobile ? 88 : 150));
    for (let n = 1; n < leafCount; n++) {
      const at = n / leafCount;
      if (at < 0.035) continue;
      const point = pointAt(at);
      const dark = onDark(point.y);
      const group = element('g', { class: `home-scroll-vine__leaf home-scroll-vine__leaf--stem${dark ? ' home-scroll-vine__leaf--light' : ''}`,
        'data-vine-leaf': '', 'data-leaf-branch': 'stem' });
      element('path', { class: 'home-scroll-vine__leaf-petiole', d: 'M0 0Q4 -1 7 0' }, group);
      const blade = element('g', { 'data-vine-leaf-blade': '' }, element('g', { transform: 'translate(7 0)' }, group));
      element('use', { href: `#vine-leaf-${n % 3 === 2 ? 'narrow' : 'full'}` }, blade);
      const scale = mobile ? [0.6, 0.68, 0.56][n % 3] : [1.02, 0.88, 1.12][n % 3];
      let accepted = false;
      for (const side of n % 2 ? [1, -1] : [-1, 1]) {
        for (const angle of [48, 34, 62]) {
          const x = point.x + point.normal.x * point.width * side, y = point.y + point.normal.y * point.width * side;
          // Point upward and outward, like a climbing vine.
          group.setAttribute('transform', `translate(${x} ${y}) rotate(${point.tangent + 180 - angle * side}) scale(${scale})`);
          if (!claim(group)) continue;
          stemLeaves.push({ group, blade, at, turn: side > 0 ? 8 : -8 });
          accepted = true;
          break;
        }
        if (accepted) break;
      }
      if (!accepted) group.remove();
    }
    finalLeaf = null;
    {
      const tip = samples.at(-1), back = samples.at(-6);
      const heading = Math.atan2(tip.y - back.y, tip.x - back.x) * 180 / Math.PI;
      const leaf = element('g', { class: `home-scroll-vine__leaf${onDark(tip.y) ? ' home-scroll-vine__leaf--light' : ''}`,
        'data-vine-leaf': '', 'data-leaf-branch': 'stem-end' });
      element('path', { class: 'home-scroll-vine__leaf-petiole', d: 'M0 0Q4 -1 7 0' }, leaf);
      const blade = element('g', { 'data-vine-leaf-blade': '' }, element('g', { transform: 'translate(7 0)' }, leaf));
      element('use', { href: '#vine-leaf-full' }, blade);
      for (const bend of [0, -18, 18, -34, 34]) {
        leaf.setAttribute('transform', `translate(${tip.x} ${tip.y}) rotate(${heading + bend}) scale(${mobile ? 0.62 : 0.95})`);
        if (claim(leaf)) { finalLeaf = { group: leaf, blade }; break; }
      }
      if (!finalLeaf) leaf.remove();
    }
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
    if (stemTube) renderTube(stemTube, progress);
    if (finalLeaf) {
      const reveal = staticMode() ? 1 : clamp((progress - 0.985) / 0.015);
      const eased = reveal * reveal * (3 - 2 * reveal);
      finalLeaf.group.style.opacity = (eased * 0.95).toFixed(3);
      finalLeaf.group.style.visibility = reveal > 0 ? 'visible' : 'hidden';
      finalLeaf.blade.setAttribute('transform', `scale(${(0.7 + 0.3 * eased).toFixed(3)})`);
    }
    stemLeaves.forEach(leaf => {
      const reveal = staticMode() ? 1 : clamp((progress - leaf.at) / 0.014);
      const eased = reveal * reveal * (3 - 2 * reveal);
      leaf.group.style.opacity = (eased * 0.95).toFixed(3);
      leaf.group.style.visibility = reveal > 0 ? 'visible' : 'hidden';
      leaf.blade.setAttribute('transform', `rotate(${(leaf.turn * (1 - eased)).toFixed(2)}) scale(${(0.7 + 0.3 * eased).toFixed(3)})`);
    });
    tendrils.forEach(tendril => {
      const local = staticMode() ? 1 : clamp((progress - tendril.at) / 0.02);
      setProgress(tendril.path, tendril.total, local);
      tendril.path.style.opacity = local > 0 ? '1' : '0';
    });
    branches.forEach(branch => {
      const local = staticMode() ? 1 : clamp((progress - branch.start) / Math.max(0.001, branch.end - branch.start));
      renderTube(branch.tube, clamp(local / Math.max(0.001, branch.tube.to)));
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
