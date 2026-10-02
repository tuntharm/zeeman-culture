import { createImageUrlBuilder } from '@sanity/image-url';

const text = value => typeof value === 'string' ? value : '';
const styles = new Set(['normal', 'h2', 'h3', 'blockquote']);
const templates = new Set(['perspectives', 'brief', 'invitation', 'custom']);
const rasterReference = /^image-([a-zA-Z0-9]+)-([1-9]\d*)x([1-9]\d*)-(jpg|jpeg|png|webp|gif|avif)$/;

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

// Attribute escaping is still required by callers after URL validation.
export function safeHref(value) {
  if (typeof value !== 'string') return '';
  const href = value.trim();
  if (!href || /[\s\\<>"'`\u0000-\u001f\u007f]/u.test(href) || /%(?:00|0a|0d)/i.test(href)) return '';
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (href.startsWith('#')) return href;
  try {
    const url = new URL(href);
    if (['https:', 'http:'].includes(url.protocol) && url.hostname && !url.username && !url.password) return href;
    if (url.protocol === 'mailto:' && url.pathname) return href;
  } catch { /* Invalid and unsupported URLs render as plain text. */ }
  return '';
}

function imageSource(image) {
  if (!image || typeof image !== 'object') return null;
  const ref = image.asset?._ref;
  const match = typeof ref === 'string' && rasterReference.exec(ref);
  if (!match || Number(match[2]) > 100000 || Number(match[3]) > 100000) return null;
  const source = { asset: { _ref: ref } };
  for (const [name, keys] of [
    ['crop', ['left', 'right', 'top', 'bottom']],
    ['hotspot', ['x', 'y', 'width', 'height']],
  ]) {
    if (image[name] == null) continue;
    if (!keys.every(key => Number.isFinite(image[name][key]) && image[name][key] >= 0 && image[name][key] <= 1)) return null;
    source[name] = Object.fromEntries(keys.map(key => [key, image[name][key]]));
  }
  if (source.crop && (source.crop.left + source.crop.right >= 1 || source.crop.top + source.crop.bottom >= 1)) return null;
  if (source.hotspot && (!source.hotspot.width || !source.hotspot.height)) return null;
  return source;
}

export function imageUrl(image, { projectId, dataset, width = 1200, height } = {}) {
  const source = imageSource(image);
  if (!source || typeof projectId !== 'string' || !/^[a-z0-9]+$/.test(projectId) ||
      typeof dataset !== 'string' || !/^[a-z0-9][a-z0-9_-]*$/.test(dataset)) return '';
  if (!Number.isInteger(width) || width < 1 || width > 8192 ||
      (height !== undefined && (!Number.isInteger(height) || height < 1 || height > 8192))) return '';
  try {
    let builder = createImageUrlBuilder({ projectId, dataset }).image(source).width(width).auto('format');
    if (height !== undefined) builder = builder.height(height);
    return builder.fit('max').url();
  } catch { return ''; }
}

function renderInline(block) {
  const definitions = Array.isArray(block.markDefs) ? block.markDefs : [];
  return (Array.isArray(block.children) ? block.children : []).map(span => {
    if (!span || span._type !== 'span') return '';
    let html = escapeHtml(text(span.text)).replace(/\r?\n/g, '<br>');
    let linked = false;
    for (const mark of new Set(Array.isArray(span.marks) ? span.marks : [])) {
      if (mark === 'strong' || mark === 'em') {
        html = `<${mark}>${html}</${mark}>`;
      } else if (!linked) {
        const definition = definitions.find(item => item && item._key === mark && item._type === 'link');
        const href = safeHref(definition?.href);
        if (href) {
          html = `<a href="${escapeHtml(href)}">${html}</a>`;
          linked = true;
        }
      }
    }
    return html;
  }).join('');
}

function renderImage(image, config, paired = false) {
  const wide = !paired && image?.width === 'wide';
  const width = paired ? 800 : wide ? 1600 : 1200;
  const src = imageUrl(image, { ...config, width });
  if (!src) return '';
  const match = rasterReference.exec(image.asset._ref);
  const crop = image.crop || { left: 0, right: 0, top: 0, bottom: 0 };
  const height = Math.max(1, Math.round(width * Number(match[3]) * (1 - crop.top - crop.bottom) /
    (Number(match[2]) * (1 - crop.left - crop.right))));
  const caption = text(image.caption).trim();
  return `<figure class="journal-body-image journal-body-image--${wide ? 'wide' : 'reading'}">` +
    `<img src="${escapeHtml(src)}" alt="${escapeHtml(text(image.alt))}" width="${width}" height="${height}" loading="lazy" decoding="async">` +
    (caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : '') + '</figure>';
}

const listType = block => block?._type === 'block' && ['bullet', 'number'].includes(block.listItem) ? block.listItem : null;
const listLevel = block => Number.isInteger(block.level) ? Math.min(6, Math.max(1, block.level)) : 1;

export function renderBody(blocks, config = {}) {
  if (!Array.isArray(blocks)) return '';
  let cursor = 0;
  const list = () => {
    const type = listType(blocks[cursor]);
    const level = listLevel(blocks[cursor]);
    const tag = type === 'number' ? 'ol' : 'ul';
    let html = `<${tag}>`;
    while (cursor < blocks.length && listType(blocks[cursor]) === type && listLevel(blocks[cursor]) === level) {
      html += `<li>${renderInline(blocks[cursor++])}`;
      while (cursor < blocks.length && listType(blocks[cursor]) && listLevel(blocks[cursor]) > level) html += list();
      html += '</li>';
    }
    return html + `</${tag}>`;
  };
  let html = '';
  while (cursor < blocks.length) {
    const block = blocks[cursor];
    if (listType(block)) {
      html += list();
      continue;
    }
    cursor++;
    if (!block || typeof block !== 'object') continue;
    if (block._type === 'block') {
      const tag = styles.has(block.style) && block.style !== 'normal' ? block.style : 'p';
      html += `<${tag}>${renderInline(block)}</${tag}>`;
    } else if (block._type === 'image') {
      html += renderImage(block, config);
    } else if (block._type === 'imagePair' && Array.isArray(block.images) && block.images.length === 2) {
      const images = block.images.map(image => renderImage(image, config, true));
      if (images.every(Boolean)) html += `<div class="journal-body-image-pair">${images.join('')}</div>`;
    }
  }
  return html;
}

// Invoke only at the publication boundary; drafts may remain incomplete and are never modified.
export function validateArticle(doc) {
  const errors = [];
  const article = doc && typeof doc === 'object' ? doc : {};
  const checkText = (value, label, maximum, required = true) => {
    if (required && !text(value).trim()) errors.push(`${label} is required.`);
    else if (value != null && typeof value !== 'string') errors.push(`${label} must be text.`);
    else if (maximum && [...text(value)].length > maximum) errors.push(`${label} must be ${maximum} characters or fewer.`);
  };
  const checkImage = (image, label) => {
    if (!imageSource(image)) errors.push(`${label} needs a valid Sanity raster image and crop settings; SVG and external images are unsupported.`);
    checkText(image?.alt, `${label} alt text`, undefined);
    checkText(image?.caption, `${label} caption`, undefined, false);
    if (image?.width != null && !['reading', 'wide'].includes(image.width)) errors.push(`${label} width must be reading or wide.`);
  };
  checkText(article.title, 'Title', 120);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(article.slug?.current))) errors.push('Slug must contain lowercase ASCII letters or numbers separated by single hyphens.');
  checkText(article.excerpt, 'Excerpt', 240);
  checkText(article.category, 'Category');
  const cover = article.cover || {};
  if (!templates.has(cover.template)) errors.push('Choose a supported cover template.');
  if (cover.template === 'custom') {
    checkImage(cover.customImage, 'Custom cover');
  } else {
  checkText(cover.phraseA, 'Cover phrase A', 36);
  checkText(cover.phraseB, 'Cover phrase B', 64);
  checkText(cover.eyebrow, 'Cover eyebrow', 40, false);
  checkText(cover.location, 'Cover location', 30, false);
  if (cover.photo != null) checkImage(cover.photo, 'Cover photo');
  }
  const body = Array.isArray(article.body) ? article.body : [];
  const bodyText = body.filter(block => block?._type === 'block')
    .flatMap(block => Array.isArray(block.children) ? block.children : [])
    .filter(span => span?._type === 'span').map(span => text(span.text)).join(' ');
  if (!/[\p{L}\p{N}]/u.test(bodyText)) errors.push('Article body needs meaningful text, not only images or punctuation.');
  body.forEach((block, index) => {
    const label = `Body block ${index + 1}`;
    if (block?._type === 'block') {
      if (block.style != null && !styles.has(block.style)) errors.push(`${label} has an unsupported text style.`);
      if (block.listItem != null && !listType(block)) errors.push(`${label} has an unsupported list type.`);
      if (block.level != null && (!Number.isInteger(block.level) || block.level < 1 || block.level > 6)) errors.push(`${label} list level must be between 1 and 6.`);
      if (!Array.isArray(block.children) || block.children.some(span => !span || span._type !== 'span' || typeof span.text !== 'string')) {
        errors.push(`${label} contains unsupported inline content.`);
      }
      if (Array.isArray(block.markDefs)) {
        block.markDefs.forEach(mark => {
          if (mark?._type !== 'link') errors.push(`${label} contains an unsupported annotation.`);
          else if (!safeHref(mark.href)) errors.push(`${label} contains an unsafe or invalid link.`);
        });
      }
    } else if (block?._type === 'image') {
      checkImage(block, `${label} image`);
    } else if (block?._type === 'imagePair') {
      if (!Array.isArray(block.images) || block.images.length !== 2) errors.push(`${label} needs exactly two images.`);
      if (Array.isArray(block.images)) block.images.forEach((image, i) => checkImage(image, `${label}, image ${i + 1}`));
    } else {
      errors.push(`${label} is unsupported.`);
    }
  });
  return errors;
}
