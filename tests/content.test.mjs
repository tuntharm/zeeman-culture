import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, safeHref, imageUrl, renderBody, validateArticle } from '../lib/content.mjs';

const config = { projectId: 'abc123xy', dataset: 'production' };
const photo = (overrides = {}) => ({
  _type: 'image', asset: { _type: 'reference', _ref: 'image-abcdef123456-1600x1200-jpg' },
  alt: 'Two people exchanging ideas', ...overrides,
});
const block = (text, overrides = {}) => ({
  _type: 'block', style: 'normal', markDefs: [],
  children: [{ _type: 'span', text, marks: [] }], ...overrides,
});
const article = () => ({
  title: 'Between cultures', slug: { current: 'between-cultures' },
  excerpt: 'A shared conversation starts with listening.', category: 'Culture',
  cover: { template: 'perspectives', phraseA: 'Meaning', phraseB: 'Context', photo: photo() },
  body: [block('There is more to a shared story than a direct translation.')],
});

test('escapeHtml makes both text and quoted attributes inert', () => {
  assert.equal(escapeHtml('<img src="x" onerror=\'alert(1)\'> &'), '&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt; &amp;');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(123), '123');
});

test('safeHref allows supported URLs and rejects executable or ambiguous destinations', () => {
  for (const url of ['https://example.com/a?x=1&y=2', 'http://example.com/', 'mailto:team@example.com', '/journal/story/', '#details']) {
    assert.equal(safeHref(url), url);
  }
  for (const url of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>', '//evil.example', '/\\evil.example', '\\evil.example', 'https://good.example\n@evil.example', 'java\tscript:alert(1)', 'javascript&#58;alert(1)', 'ftp://example.com', 'https://', {}, null]) {
    assert.equal(safeHref(url), '', String(url));
  }
});

test('imageUrl produces only the configured Sanity CDN URL and honors crop and hotspot', () => {
  const image = photo({
    crop: { top: 0, bottom: 0, left: 0.25, right: 0 },
    hotspot: { x: 0.7, y: 0.3, width: 0.2, height: 0.2 },
  });
  const url = new URL(imageUrl(image, { ...config, width: 600, height: 300 }));
  assert.equal(url.origin, 'https://cdn.sanity.io');
  assert.equal(url.pathname, '/images/abc123xy/production/abcdef123456-1600x1200.jpg');
  assert.equal(url.searchParams.get('w'), '600');
  assert.equal(url.searchParams.get('h'), '300');
  assert.ok(url.searchParams.has('rect'), 'Editor crop must affect the generated URL');
  const changed = imageUrl({ ...image, hotspot: { ...image.hotspot, y: 0.8 } }, { ...config, width: 600, height: 300 });
  assert.notEqual(changed, url.href, 'Hotspot must affect a constrained image crop');
});

test('imageUrl rejects arbitrary URLs, SVG references, unsafe configuration and malformed crop', () => {
  const invalid = [
    photo({ asset: { url: 'https://evil.example/photo.jpg' } }),
    photo({ asset: { _ref: 'image-abcdef123456-1600x1200-svg' } }),
    photo({ asset: { _ref: 'image-../../evil-1600x1200-jpg' } }),
    photo({ crop: { left: 0.7, right: 0.7, top: 0, bottom: 0 } }),
    photo({ hotspot: { x: NaN, y: 0.5, width: 1, height: 1 } }),
    null,
  ];
  for (const image of invalid) assert.equal(imageUrl(image, config), '');
  assert.equal(imageUrl(photo()), '');
  assert.equal(imageUrl(photo(), { ...config, dataset: '../private' }), '');
  assert.equal(imageUrl(photo(), { ...config, projectId: 'evil/x' }), '');
});

test('renderBody safely renders supported text styles, links and marks without raw HTML', () => {
  const html = renderBody([
    block('<script>alert(1)</script>\nNext line', { style: 'h2', children: [{ _type: 'span', text: '<script>alert(1)</script>\nNext line', marks: ['strong', 'em'] }] }),
    block('Safe link', { markDefs: [{ _key: 'a', _type: 'link', href: '/journal/?a=1&b=2' }], children: [{ _type: 'span', text: 'Safe link', marks: ['a'] }] }),
    block('Unsafe link', { markDefs: [{ _key: 'a', _type: 'link', href: 'javascript:alert(1)' }], children: [{ _type: 'span', text: 'Unsafe link', marks: ['a'] }] }),
    block('A quotation', { style: 'blockquote' }),
    { _type: 'html', html: '<img src=x onerror=alert(1)>' },
  ], config);
  assert.match(html, /<h2><em><strong>&lt;script&gt;alert\(1\)&lt;\/script&gt;<br>Next line<\/strong><\/em><\/h2>/);
  assert.match(html, /<a href="\/journal\/\?a=1&amp;b=2">Safe link<\/a>/);
  assert.match(html, /<p>Unsafe link<\/p>/);
  assert.match(html, /<blockquote>A quotation<\/blockquote>/);
  assert.doesNotMatch(html, /<script|javascript:|onerror=/);
});

test('renderBody maintains nested and mixed list structure and resumes paragraphs', () => {
  const html = renderBody([
    block('First', { listItem: 'bullet', level: 1 }),
    block('Nested one', { listItem: 'number', level: 2 }),
    block('Nested two', { listItem: 'number', level: 2 }),
    block('Second', { listItem: 'bullet', level: 1 }),
    block('Ordered', { listItem: 'number', level: 1 }),
    block('After'),
  ]);
  assert.equal(html, '<ul><li>First<ol><li>Nested one</li><li>Nested two</li></ol></li><li>Second</li></ul><ol><li>Ordered</li></ol><p>After</p>');
});

test('renderBody renders image layout choices with escaped alt and captions', () => {
  const html = renderBody([
    photo({ width: 'wide', alt: '"><script>alert(1)</script>', caption: '<b>Caption</b>' }),
    { _type: 'imagePair', images: [photo(), photo({ caption: 'Second photo' })] },
    photo({ asset: { _ref: 'image-abcdef-20x20-svg' } }),
  ], config);
  assert.match(html, /class="journal-body-image journal-body-image--wide"/);
  assert.match(html, /class="journal-body-image-pair"/);
  assert.match(html, /alt="&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;"/);
  assert.match(html, /<figcaption>&lt;b&gt;Caption&lt;\/b&gt;<\/figcaption>/);
  assert.equal((html.match(/<img /g) || []).length, 3);
  assert.doesNotMatch(html, /<script|\.svg/);
});

test('renderBody tolerates incomplete drafts and malformed untrusted values', () => {
  for (const input of [null, {}, 'text', [null, {}, { _type: 'block', children: [null, {}, { _type: 'span', text: {} }] }]]) {
    assert.doesNotThrow(() => renderBody(input, config));
  }
  assert.equal(renderBody([{ _type: 'imagePair', images: [photo()] }], config), '');
});

test('validateArticle accepts a complete article and does not mutate drafts', () => {
  const valid = article();
  valid.body.push(photo({ width: 'reading' }), { _type: 'imagePair', images: [photo(), photo()] });
  assert.deepEqual(validateArticle(valid), []);
  const draft = { title: '', body: [] };
  const before = structuredClone(draft);
  assert.ok(validateArticle(draft).length > 0);
  assert.deepEqual(draft, before);
});

test('validateArticle permits a complete article without the optional cover photo', () => {
  const valid = article();
  delete valid.cover.photo;
  assert.deepEqual(validateArticle(valid), []);
  valid.cover.photo = null;
  assert.deepEqual(validateArticle(valid), []);
  valid.cover.photo = photo({ alt: '' });
  assert.match(validateArticle(valid).join('\n'), /cover photo alt text/i);
});

test('validateArticle reports publish requirements for text, slug, cover and images', () => {
  const invalid = article();
  invalid.title = 'x'.repeat(121);
  invalid.slug.current = '../Not-safe';
  invalid.excerpt = 'x'.repeat(241);
  invalid.cover.template = 'arbitrary';
  invalid.cover.phraseA = '';
  invalid.cover.phraseB = 'x'.repeat(65);
  invalid.cover.eyebrow = 'x'.repeat(41);
  invalid.cover.location = 'x'.repeat(31);
  invalid.cover.photo.alt = '';
  invalid.body = [block('   ...   '), photo({ alt: '' }), { _type: 'imagePair', images: [photo()] }];
  const errors = validateArticle(invalid).join('\n');
  for (const expected of [/title.*120/i, /slug/i, /excerpt.*240/i, /template/i, /phrase.*A/i, /phrase.*B.*64/i, /eyebrow.*40/i, /location.*30/i, /cover.*alt/i, /body.*text/i, /image.*alt/i, /two.*image/i]) {
    assert.match(errors, expected);
  }
});

test('validateArticle rejects unsupported content and unsafe links or raster references', () => {
  const invalid = article();
  invalid.body.push(
    block('A link', { markDefs: [{ _key: 'link', _type: 'link', href: 'data:text/html,test' }] }),
    photo({ asset: { _ref: 'image-abcdef123456-1600x1200-svg' } }),
    { _type: 'html', html: '<script>alert(1)</script>' },
  );
  const errors = validateArticle(invalid).join('\n');
  assert.match(errors, /link/i);
  assert.match(errors, /raster/i);
  assert.match(errors, /unsupported/i);
});

test('custom covers require an uploaded image and alt text, not template phrases', () => {
  const doc = article();
  doc.cover = { template: 'custom', customImage: photo() };
  assert.deepEqual(validateArticle(doc), []);
  delete doc.cover.customImage;
  assert.ok(validateArticle(doc).some(error => error.includes('Custom cover')));
  doc.cover.customImage = photo({ alt: '' });
  assert.ok(validateArticle(doc).some(error => error.includes('alt text')));
  doc.cover.customImage = photo({asset:{_ref:'image-abcdef123456-1600x1200-svg'}});
  assert.ok(validateArticle(doc).some(error => error.includes('raster')));
});
