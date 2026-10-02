"""Public HTML contracts; run with python3 -m unittest discover -s tests."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
SLUGS = ('translation-beyond-language', 'creator-brief-local-voice', 'london-pop-up-shared-story')

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.refs, self.ids, self.nav, self.robots = [], set(), {}, ''
        self.in_nav, self.link, self.label = False, None, []
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'): self.ids.add(attrs['id'])
        if tag == 'nav' and attrs.get('aria-label') == 'Main navigation': self.in_nav = True
        if tag == 'a' and self.in_nav:
            self.link, self.label = attrs, []
        if tag == 'meta' and attrs.get('name') == 'robots': self.robots = attrs.get('content', '')
        if tag in ('a', 'link', 'script', 'img', 'source'):
            for key in ('href', 'src'):
                if attrs.get(key): self.refs.append(attrs[key])
    def handle_data(self, data):
        if self.link is not None: self.label.append(data)
    def handle_endtag(self, tag):
        if tag == 'a' and self.link is not None:
            self.nav[''.join(self.label).strip()] = self.link
            self.link = None
        if tag == 'nav': self.in_nav = False

class SiteContract(unittest.TestCase):
    maxDiff = 160
    def pages(self):
        return [ROOT / 'index.html', *ROOT.glob('about/*.html'), *ROOT.glob('contact/*.html'),
                *ROOT.glob('privacy/*.html'), *ROOT.glob('work/*.html'),
                *ROOT.glob('services/*/*.html'), *ROOT.glob('journal/**/*.html')]
    def test_navigation_destinations(self):
        for path in self.pages():
            with self.subTest(page=str(path.relative_to(ROOT))):
                nav = Page(path).nav
                self.assertEqual(nav['Cases']['href'], '/work/')
                self.assertEqual(nav['Journal']['href'], '/journal/')
    def test_journal_routes_exist_and_are_samples(self):
        for path in [ROOT / 'journal/index.html', *(ROOT / 'journal' / slug / 'index.html' for slug in SLUGS)]:
            with self.subTest(page=str(path.relative_to(ROOT))):
                self.assertTrue(path.is_file())
                self.assertIn('noindex', Page(path).robots)
                self.assertIn('Sample editorial', path.read_text())
    def test_article_length(self):
        for slug in SLUGS:
            path = ROOT / 'journal' / slug / 'index.html'
            self.assertTrue(path.is_file())
            body = re.search(r'<div class="journal-article__body"[^>]*>(.*?)</div>', path.read_text(), re.S)
            self.assertIsNotNone(body, 'Article body must be identifiable for its editorial word count')
            words = re.findall(r"\b[\w]+(?:['’][\w]+)*\b", re.sub(r'<[^>]+>', ' ', body.group(1)))
            self.assertGreaterEqual(len(words), 400)
            self.assertLessEqual(len(words), 600)
    def test_homepage_journal_order(self):
        source = (ROOT / 'index.html').read_text()
        self.assertLess(source.index('id="cases"'), source.index('id="journal"'))
        self.assertLess(source.index('id="journal"'), source.index('<footer'))
        for slug in SLUGS: self.assertIn('/journal/' + slug + '/', source)
    def test_local_resources_and_anchors(self):
        pages = {path: Page(path) for path in self.pages()}
        for path, page in pages.items():
            for ref in page.refs:
                url = urlsplit(ref)
                if url.scheme or url.netloc or not url.path.startswith('/'): continue
                target = ROOT / unquote(url.path.lstrip('/'))
                if target.is_dir(): target /= 'index.html'
                with self.subTest(page=str(path.relative_to(ROOT)), ref=ref):
                    self.assertTrue(target.is_file(), 'Missing local destination')
                    if url.fragment and target.suffix == '.html':
                        self.assertIn(url.fragment, pages.get(target, Page(target)).ids)
    def test_selected_case_destinations(self):
        source = (ROOT / 'index.html').read_text()
        self.assertIn('href="/services/social-media-management/#dram5" aria-label="Explore DRAM5', source)
        self.assertIn('href="/services/offline-activations/#joybuy" aria-label="Explore Joybuy', source)

if __name__ == '__main__': unittest.main()
