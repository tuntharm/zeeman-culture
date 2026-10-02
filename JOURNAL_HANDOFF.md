# Zeeman Journal editor demo

The approved botanical website was pushed before this work: commit `41e4674` on `redesign/homepage-first-client-edit`. The connected editor work is on `codex/journal-studio` and is the production release branch.

## Client flow

1. Open **Team login** in the website footer, or go to `/studio/`.
2. Sign in with an invited Sanity account. No shared key is placed in the website.
3. Open **Your articles** and create an article, or edit an existing draft.
4. Under **Story**, enter the title, introduction and body. The body supports headings, bold, italic, links, lists, photos and pairs of photos.
5. Under **Cover**, choose Between Cultures, Creator Brief, Invitation or **Upload your own cover**. For a custom cover, upload a finished JPG, PNG or WebP design (recommended 1200 × 900 px), describe the image, and check its crop in the preview. Template wording fields are hidden in this mode; your previous template content is retained when switching. For the three templates, enter two short phrases, optional small text and an optional photo. The image crop/focal point controls choose which part of a photo appears.
6. Under **Publishing**, generate the web address, choose a category and related service, and set the article date. Keep the original address after publishing; validation protects it.
7. Use **Preview** to see the draft article. **Publish** makes the saved version appear on the Journal, the homepage carousel and its direct article URL. Draft edits remain private until published.

The draft **A space to gather, a story to share** demonstrates a cover photo, a photo within the body, and a pair of photos. It is visibly marked Sample editorial. The other three sample articles are already published in the demo CMS.

## Local development

```sh
npm ci
# Pull development envs with the Vercel CLI, or put supplied credentials in ignored .env.local.
npm run build
npm run dev
```

Website: `http://127.0.0.1:8093/` · Studio: `http://127.0.0.1:8093/studio/`.

Sanity project `29wa60ec`, dataset `production`, is the newly provisioned **zeeman-journal-demo** resource connected to the Zeeman Vercel project. The dataset name is Sanity's default. Only the public project ID and dataset are bundled into Studio. Read/write tokens remain server-side or in ignored local environment files.

Use `npm run seed:journal` once to import the three source samples. It uses `createIfNotExists` and does not overwrite edits. `node --env-file=.env.local scripts/create-photo-demo.mjs` adds the practice draft using two existing public website images.

## Content and rendering

- Native Sanity Studio provides sign-in, drafts, image uploads and publishing.
- `studio/schema.js` defines editable fields; `lib/cover.mjs` supplies the three cover templates.
- `lib/content.mjs` validates and safely renders supported Portable Text blocks.
- The same cover and body functions serve both the authenticated draft preview and the public pages.
- `api/site.js` reads only published articles, renders HTML on the server, and uses no-store responses so publication changes appear on refresh without a redeploy.
- `scripts/build.mjs` builds Studio and copies only public website files into `dist/`. Client agreements, source files and credentials are excluded. The local server only serves that output.
- Other site routes and the approved homepage vine are retained. Every built public footer links to Team login.

## Verification

```sh
npm test
python3 -m unittest discover -s tests
npm run build
# With the preview running:
node tests/server.integration.mjs
```

Before customer handover, invite named customer accounts with suitable content roles, verify their login, configure the actual hosted Studio origin, and verify the hosted website and Studio. Customer invitations are not sent automatically.

Avoid changing or deleting published addresses without a redirect migration. Publishing a future date does not schedule an article; the date controls ordering only. Use Draft until it is ready.

## Current demo verification (2 October 2026)

- Build passes; 18 Node tests and 6 existing Python checks pass.
- Real CMS API draft → publish → unpublish verified against the local homepage, Journal and direct article route; temporary test records removed.
- Public article layout inspected at 360, 390, 768, 1024 and 1440 px without horizontal overflow.
- Server credentials absent from all 417 generated build files; private-file and draft URL checks return 404.
- Local Studio sign-in, draft editing, custom-cover selection and article preview were checked in the browser. A private custom-cover practice draft is available; it has not been published.
- Dependency audit: no high or critical findings; six moderate entries trace to the inherited `typeid-js` / `uuid` advisory. Do not force an incompatible major override without an upstream update or compatibility review.
- Customer invitations have not been sent. Production release verification is recorded below after deployment.

For ongoing environment management and deployment, install the Vercel CLI with `npm i -g vercel`. Setup in this session used `npx vercel@latest`.
