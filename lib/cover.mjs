const INK = '#0F4A36';
const PAPER = '#F7F8F4';
const MINT = '#C7E0D1';
const WINE = '#7A3340';
const SERIF = 'Georgia, Times New Roman, serif';
const SANS = 'Arial, Helvetica, sans-serif';

export const COVER_TEMPLATES = Object.freeze([
  { value: 'perspectives', title: 'Between Cultures', description: 'Two perspectives, one conversation.', phraseA: 'Meaning', phraseB: 'Context', eyebrow: 'BETWEEN CULTURES', location: 'LONDON · SHANGHAI' },
  { value: 'brief', title: 'Creator Brief', description: 'A shared idea with a local voice.', phraseA: 'Shared idea.', phraseB: 'Local expression.', eyebrow: 'THE CREATOR BRIEF', location: 'MAKE ROOM FOR A LOCAL VOICE.' },
  { value: 'invitation', title: 'Invitation', description: 'An invitation paired with a photo.', phraseA: 'Come together.', phraseB: 'A story to share.', eyebrow: 'OFFLINE TO ONLINE', location: 'LONDON' },
  { value: 'custom', title: 'Upload your own cover', description: 'Use your finished design. Recommended: 1200 × 900 px.' },
]);

export function coverPhotoSize(template) {
  if (template === 'custom') return { width: 1200, height: 900 };
  const height = template === 'invitation' ? 1175 : template === 'brief' ? 434 : 568;
  return { width: 1200, height };
}

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
const clean = (value, fallback, limit) => {
  const text = typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim() : '';
  return [...(text || fallback)].slice(0, limit).join('');
};

// SVG documents must never receive executable or SVG-in-SVG photo URLs.
const safePhoto = value => {
  if (typeof value !== 'string') return '';
  if (/^data:image\/(?:png|jpeg|webp);base64,[a-z\d+/=\s]+$/i.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
};

const textWidth = (text, size) => [...text].reduce((total, char) => total + (/\s/.test(char) ? .29 : /[ilI.,'!:;]/.test(char) ? .27 : /[MW@]/.test(char) ? .92 : char.codePointAt(0) > 0x2ff ? 1 : .55), 0) * size;
const wrap = (text, size, width) => {
  const words = text.split(' ').flatMap(word => {
    if (textWidth(word, size) <= width) return [word];
    const pieces = [];
    let piece = '';
    for (const character of word) {
      if (piece && textWidth(piece + character, size) > width) { pieces.push(piece); piece = ''; }
      piece += character;
    }
    if (piece) pieces.push(piece);
    return pieces;
  });
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && textWidth(`${line} ${word}`, size) > width) { lines.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
};

function phrase(text, { x, top, width, height, size = 72, color = INK, italic = false }) {
  let fontSize = size;
  let lines = wrap(text, fontSize, width);
  while (fontSize > 18 && lines.length * fontSize * 1.08 > height) {
    fontSize -= 1;
    lines = wrap(text, fontSize, width);
  }
  const baseline = top + (height - lines.length * fontSize * 1.08) / 2 + fontSize * .87;
  return `<text fill="${color}" font-family="${SERIF}" font-size="${fontSize}"${italic ? ' font-style="italic"' : ''}>${lines.map((line, i) => `<tspan x="${x}" y="${(baseline + i * fontSize * 1.08).toFixed(2)}">${escape(line)}</tspan>`).join('')}</text>`;
}

function label(text, x, y, { color = INK, size = 16, spacing = 3, width = 980 } = {}) {
  const fontSize = Math.min(size, width / Math.max(1, textWidth(text, 1) + [...text].length * spacing / size));
  return `<text x="${x}" y="${y}" fill="${color}" font-family="${SANS}" font-size="${fontSize.toFixed(2)}" letter-spacing="${(spacing * fontSize / size).toFixed(2)}">${escape(text)}</text>`;
}

const rules = (d, color = INK, opacity = '.17') => `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="3"/>`;
const photo = (url, id, x, y, width, height) => url ? `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath><image href="${escape(url)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>` : '';

const botany = (id, main, branches, leaves) => `<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round"><path d="${main}" stroke-width="3.5"/><path d="${branches}" stroke-width="2"/></g>${leaves.map(([shape, transform]) => `<use href="#${id}-${shape}" transform="${transform}"/>`).join('')}`;

function perspectives(c, id, url) {
  return `<g transform="translate(122 177) rotate(-5 216 254)">
    <rect x="8" y="11" width="426" height="508" fill="${INK}" opacity=".035"/><rect width="426" height="508" fill="#FCFCF7" stroke="${INK}" stroke-opacity=".18"/>
    ${label('LONDON', 40, 56, { size: 17, spacing: 4 })}<path d="M40 80H386" stroke="${INK}" stroke-opacity=".25"/>
    ${phrase(c.phraseA, { x: 37, top: 121, width: 349, height: 113, size: 70 })}
    ${rules('M42 256H253M42 271H341M42 286H295')}
    <circle cx="79" cy="412" r="38" fill="none" stroke="${INK}" stroke-opacity=".32"/><path d="M52 412H106M79 385V439" stroke="${INK}" stroke-opacity=".32"/><path d="M284 428H380M359 413L380 428L359 443" stroke="${INK}" stroke-width="2" fill="none"/>
  </g><g transform="translate(653 224) rotate(5 210 241)">
    <rect x="8" y="11" width="412" height="485" fill="${INK}" opacity=".035"/><rect width="412" height="485" fill="#E1EBDE" stroke="${INK}" stroke-opacity=".18"/>
    ${label('SHANGHAI', 38, 55, { size: 17, spacing: 4 })}<path d="M38 80H374" stroke="${INK}" stroke-opacity=".25"/>
    ${phrase(c.phraseB, { x: 33, top: 115, width: 346, height: 133, size: 72, color: WINE, italic: true })}
    ${url ? photo(url, `${id}-photo`, 38, 272, 336, 159) : `${rules('M40 256H303M40 271H240M40 286H344')}<path d="M36 410H132M57 395L36 410L57 425" stroke="${INK}" stroke-width="2" fill="none"/><circle cx="335" cy="409" r="32" fill="${WINE}" opacity=".88"/><circle cx="335" cy="409" r="23" fill="none" stroke="${PAPER}" stroke-opacity=".6"/>`}
  </g>${botany(id,
    'M320 745C372 700 383 635 428 589C475 541 542 540 577 494C611 451 594 385 629 342C665 298 724 281 776 298',
    'M421 597C445 610 465 609 483 592M493 548C478 523 481 503 501 486M571 502C600 515 619 510 634 490M614 372C592 366 580 353 577 335M658 316C682 328 703 325 722 312',
    [['leaf', 'translate(483 592) rotate(-18) scale(.9)'], ['leaf', 'translate(501 486) rotate(-97) scale(1.03)'], ['leaf', 'translate(634 490) rotate(15) scale(.86)'], ['leaf', 'translate(577 335) rotate(-158) scale(.94)'], ['bud', 'translate(722 312) rotate(55) scale(.8)']])}`;
}

function brief(c, id, url) {
  return `<g transform="translate(131 163) rotate(-4 227 252)">
    <rect x="9" y="12" width="454" height="513" fill="${INK}" opacity=".05"/><rect width="454" height="513" fill="${INK}"/>
    ${label('THE CONSTANT', 43, 58, { color: MINT })}<path d="M43 82H411" stroke="${MINT}" stroke-opacity=".4"/>
    ${phrase(c.phraseA, { x: 39, top: 120, width: 372, height: 179, size: 73, color: PAPER })}
    ${url ? photo(url, `${id}-photo`, 43, 325, 368, 133) : `${rules('M44 330H349M44 348H280M44 366H328', MINT, '.35')}${label('PURPOSE · PROMISE', 43, 457, { color: MINT, size: 17, spacing: 2 })}`}
  </g><g transform="translate(627 221) rotate(4 214 246)">
    <rect x="9" y="12" width="427" height="493" fill="${INK}" opacity=".04"/><rect width="427" height="493" fill="#FCFCF7" stroke="${INK}" stroke-opacity=".16"/>
    ${label('THE INTERPRETATION', 40, 56, { color: WINE })}<path d="M40 80H387" stroke="${INK}" stroke-opacity=".25"/>
    ${phrase(c.phraseB, { x: 35, top: 113, width: 357, height: 156, size: 66, italic: true })}
    <path d="M40 288C137 278 242 282 376 276" fill="none" stroke="${WINE}" stroke-width="2.5"/>
    ${rules('M41 331H312M41 349H366M41 367H260')}${label('VOICE · CONTEXT', 40, 443, { size: 17, spacing: 2 })}
  </g><path d="M502 147C524 140 547 142 565 154M556 142L565 154L550 158" fill="none" stroke="${WINE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  ${botany(id,
    'M436 766C490 732 521 689 543 637C567 580 569 522 594 469C619 415 620 365 592 319',
    'M514 690C537 700 558 696 577 678M549 621C528 610 516 591 515 571M610 416C591 411 578 398 573 382M602 341C620 335 629 322 632 308',
    [['leaf', 'translate(577 678) rotate(4) scale(.9)'], ['broad', 'translate(515 571) rotate(-72) scale(.93)'], ['leaf', 'translate(573 382) rotate(-135) scale(.85)'], ['bud', 'translate(632 308) rotate(20) scale(.85)']])}`;
}

function invitation(c, id, url) {
  return `<g transform="translate(631 166) rotate(6 216 255)">
    <rect x="9" y="12" width="431" height="526" fill="${INK}" opacity=".04"/><rect width="431" height="526" fill="#FCFCF7" stroke="${INK}" stroke-opacity=".15"/>
    <rect x="26" y="26" width="379" height="371" fill="url(#${id}-frame)"/>
    ${url ? photo(url, `${id}-photo`, 26, 26, 379, 371) : `<circle cx="215" cy="210" r="99" fill="${PAPER}" opacity=".45"/><circle cx="215" cy="210" r="65" fill="none" stroke="${INK}" stroke-opacity=".22"/><path d="M61 105V62H104M327 62H370V105M370 318V361H327M104 361H61V318" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M196 210H234M215 191V229" fill="none" stroke="${INK}" stroke-opacity=".4" stroke-width="1.5"/>`}
    ${phrase(c.phraseB, { x: 27, top: 412, width: 377, height: 64, size: 43, italic: true })}<path d="M28 490H202" stroke="${INK}" stroke-opacity=".23"/>
  </g><g transform="translate(128 237) rotate(-6 226 244)">
    <rect x="9" y="12" width="453" height="480" fill="${INK}" opacity=".045"/><rect width="453" height="480" fill="${WINE}"/><rect x="23" y="23" width="407" height="434" fill="none" stroke="${PAPER}" stroke-opacity=".35"/>
    ${label('AN INVITATION', 48, 75, { color: PAPER, spacing: 4 })}<path d="M49 101H401" stroke="${PAPER}" stroke-opacity=".3"/>
    ${phrase(c.phraseA, { x: 44, top: 138, width: 358, height: 169, size: 74, color: PAPER })}<path d="M49 349H206" stroke="${PAPER}" stroke-opacity=".45"/>
    ${label(c.location, 49, 407, { color: PAPER, size: 17, width: 271 })}<circle cx="366" cy="394" r="23" fill="none" stroke="${PAPER}" stroke-opacity=".6"/><path d="M354 394H377M369 386L377 394L369 402" fill="none" stroke="${PAPER}" stroke-width="1.5"/>
  </g>${botany(id,
    'M455 777C506 732 535 684 550 627C565 569 578 522 619 480C660 438 696 414 718 368C742 319 737 280 772 234',
    'M526 692C549 700 570 693 586 675M562 580C541 569 532 551 535 531M617 482C644 493 666 486 682 468M703 395C681 387 669 371 668 350M739 292C764 300 782 293 795 276',
    [['leaf', 'translate(586 675) rotate(2) scale(.95)'], ['broad', 'translate(535 531) rotate(-71) scale(.93)'], ['leaf', 'translate(682 468) rotate(-8) scale(.88)'], ['leaf', 'translate(668 350) rotate(-140) scale(.9)'], ['bud', 'translate(795 276) rotate(50) scale(.9)']])}`;
}

/** Render trusted template markup with escaped user text and an optional raster photo. */
export function renderCover(cover = {}, { photoUrl = '', idPrefix = 'cover' } = {}) {
  const input = cover && typeof cover === 'object' ? cover : {};
  if (input.template === 'custom') {
    const id = `z-${String(idPrefix).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'cover'}`;
    const url = safePhoto(photoUrl);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${escape(clean(input.customImage?.alt, 'Upload your own cover', 1000))}</title>${url ? `<image href="${escape(url)}" x="0" y="0" width="1200" height="900" preserveAspectRatio="xMidYMid slice"/>` : `<rect width="1200" height="900" fill="${PAPER}"/><rect x="95" y="95" width="1010" height="710" rx="20" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="12 12"/><g fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M600 475V290M540 350L600 290L660 350M470 460V520H730V460"/></g><text x="600" y="630" text-anchor="middle" font-family="${SANS}" font-size="38" fill="${INK}">Your finished design</text><text x="600" y="690" text-anchor="middle" font-family="${SANS}" font-size="25" fill="${INK}">JPG · PNG · WebP / 1200 × 900 px</text>`}</svg>`;
  }
  const template = COVER_TEMPLATES.find(item => item.value === input.template) || COVER_TEMPLATES[0];
  const c = {
    phraseA: clean(input.phraseA, template.phraseA, 36),
    phraseB: clean(input.phraseB, template.phraseB, 64),
    eyebrow: clean(input.eyebrow, template.eyebrow, 60),
    location: clean(input.location, template.location, 60),
  };
  const id = `z-${String(idPrefix).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'cover'}`;
  const url = safePhoto(photoUrl);
  const body = ({ perspectives, brief, invitation })[template.value](c, id, url);
  const background = template.value === 'brief' ? '#E2EBDD' : template.value === 'invitation' ? '#F0F0E7' : `url(#${id}-paper)`;
  const footer = template.value === 'invitation' ? 'A MOMENT THAT TRAVELS FURTHER.' : c.location;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">${escape(`${c.phraseA} — ${c.phraseB}`)}</title><desc id="${id}-desc">${escape(`${template.title} editorial cover. ${url ? clean(input.photo?.alt, 'Photograph in an editorial paper frame.', 300) : 'Botanical illustration on offset paper compositions.'}`)}</desc>
  <defs>
    <linearGradient id="${id}-paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${PAPER}"/><stop offset="1" stop-color="#E9EBDD"/></linearGradient>
    <linearGradient id="${id}-frame" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#D7E7D9"/><stop offset="1" stop-color="#B3CDBA"/></linearGradient>
    <g id="${id}-leaf"><path d="M0 0C9-20 31-30 52-25C46-7 26 7 0 0Z" fill="${INK}"/><path d="M3-1Q25-9 43-20" fill="none" stroke="${MINT}" stroke-width="1.5"/></g>
    <g id="${id}-broad"><path d="M0 0C-1-21 14-40 36-43C47-23 33 1 0 0Z" fill="${INK}"/><path d="M3-3Q18-16 31-36" fill="none" stroke="${MINT}" stroke-width="1.5"/></g>
    <g id="${id}-bud"><path d="M0 0C2-14 11-26 24-29C26-15 18-3 0 0Z" fill="${INK}"/></g>
  </defs><rect width="1200" height="900" fill="${background}"/><path d="M86 92H1114M86 808H1114" stroke="${INK}" stroke-opacity=".2"/>
  ${label(c.eyebrow, 88, 64, { spacing: 4, width: 900 })}${label(`0${COVER_TEMPLATES.indexOf(template) + 1}`, 1085, 64)}${body}${label(footer, 88, 848, { size: 15, spacing: 2.5 })}
  </svg>`;
}
