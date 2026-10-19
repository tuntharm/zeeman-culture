# Zeeman Culture

Static presentation website for Zeeman Culture, a cross-cultural creative
marketing agency operating across London and Shanghai.

## Local preview

Build and serve the actual application from the repository root:

```sh
npm run build
node scripts/dev-server.mjs
```

Then open `http://127.0.0.1:8093/`. Avoid `file://` or a root static server:
they bypass the public-page rendering and feature switch.

## Checks

```sh
npm test
python3 -m unittest discover -s tests
node tests/server.integration.mjs
node --check assets/js/site.js
node --check assets/js/home-vine.js
node --check assets/js/home-journal.js
```

Journal is temporarily paused using `JOURNAL_ENABLED = false` in
`lib/features.mjs`. The public build removes its navigation, homepage carousel
and Team login, returns 404 for Journal URLs, and skips the Studio build.
The article source, Sanity content and editor configuration are retained.

To restore it, set the switch to `true`, rebuild, and restart the preview with
`npm run dev` so the existing `.env.local` CMS settings load. Deploy separately
after review. Do not delete or recreate Sanity content to restore Journal.

## Services and homepage overview

`/services/` contains three progressively enhanced service panels. The query
`?service=influencer-marketing`, `?service=social-media-management` or
`?service=offline-activations` selects a panel; case fragments select and scroll
to their containing panel. The old category URLs redirect with HTTP 308 in both
the local server and `vercel.json`. Without JavaScript, every panel is readable.

The Cases directory owns the four homepage carousel cards. During build,
`lib/home-overview.mjs` copies Khao So-i, Sen Sen, Azuki Room and Lotus Realm into
the homepage before generating the API template. Rebuild and restart the local
server after changing page HTML. Hazzys and Joybuy have both Influencer and
Offline category memberships; the directory still contains nine case records.

Brand artwork provenance and intentional text fallbacks are recorded in
`assets/brand/partners/SOURCES-2026-10.md`. The source deck's creator images are
kept at modest display sizes. No new campaign results were invented.

For the overview's additional local integration checks:

```sh
TEST_ORIGIN=http://127.0.0.1:8093 node --test tests/services-overview.test.mjs
```
