# Little Wonder

**One small discovery. Every day.**

A free, English-language reading room that feels like opening an illustrated book. Take a minute with a philosophical puzzle, a literary discovery, an unexpected piece of history, or something remarkable about the natural world.

**Read it:** https://melvinvarghese.github.io/Little-Wonder/

## What is here

The launch library contains **60 original discoveries in six collections**, ten in each:

- **The Thinking Room:** philosophy and thought experiments.
- **Between the Lines:** books, authors, and literary history.
- **The Curious Past:** overlooked people, inventions, and historical curiosities.
- **Nature’s Secrets:** living things and the natural world.
- **Beyond the Obvious:** probability, perception, and counterintuitive science.
- **The Unanswered:** genuine questions still open to inquiry.

Open the illustrated cover for the daily discovery, browse the Reading Shelf, search titles and keywords, choose a collection, or let “Surprise me” choose. Each discovery has its own permanent page, sources, a reflection, previous/next navigation, save control, and sharing.

“My Little Collection” saves favourites in this browser. Export a JSON backup and import it on another device. Imports merge rather than replace; unknown saved identifiers are preserved. Corrupted saved data is not overwritten, and the collection page offers a raw recovery download when the original data can be read.

There are no accounts, tracking scripts, external image/font dependencies, paid services, or runtime AI calls. The cover illustration is a one-time original generated asset stored in this repository; the running site does not generate images or call an AI service.

## How it is built and hosted

This is plain HTML, CSS, and JavaScript. A small **build script** (a program that assembles pages from the content files) runs on Node.js 20 or newer. It produces ordinary HTML files, including a real page for every discovery. GitHub Pages serves those files without a server or database.

The existing Pages setting publishes **main → / (root)**. Generated pages are committed with the source files, so no deployment workflow, secret, or paid build service is needed. `.nojekyll` tells Pages to serve the files as they are. After a push, check the repository's **Actions → pages build and deployment** for the actual deployment result.

Normal navigation and asset paths are relative to each document, so the `/Little-Wonder/` project path works. The custom 404 page has an explicit production base because a missing nested URL retains its address. If you rename the repository or move the site, update the production addresses in `scripts/build.mjs` and rebuild.

Daily selection converts the visitor's **local calendar date** to a day index, then chooses from the ordered library. It is stable on the same date and collection version. An open tab checks every 30 seconds and when it becomes visible again. The 60 launch readings repeat after 60 days; adding or reordering content can change the rotation.

## Where things live

```text
content/
  categories.json              Collection names, descriptions and identities
  thinking-room.json           Philosophy discoveries
  between-the-lines.json       Literary discoveries
  curious-past.json            History discoveries
  natures-secrets.json         Nature discoveries
  beyond-obvious.json          Science/maths discoveries
  unanswered.json              Open questions
research/                      Source-verification notes for launch articles
scripts/build.mjs              Reproducible generator and shared templates
assets/
  app.js                       Browser interactions and local storage
  core.js                      Selection/search/import helpers
  style.css                    Book design and responsive styles
  cover-art.webp               Optimized original cover illustration
  favicon.svg                  Original emblem
  ARTWORK.md                   Artwork origin record
  articles.json                Generated browser search/daily index
  categories.json              Generated browser category index
wonders/<permanent-id>/         Generated individual reading pages
categories/                    Generated collection pages
shelf/                         Generated Reading Shelf
collection/                    Generated saved-favourites page
about/, how-it-works/,
sources/, privacy/             Generated information pages
index.html, 404.html            Generated homepage and missing-page fallback
tests/                         Content, build, helper and browser tests
docs/                          Build decisions and verified test record
site-manifest.json             Generated list of all public HTML pages
```

Do not change generated HTML or the generated JSON in `assets/` to edit content. Change `content/` and rebuild so everything stays consistent.

## Adding a discovery

The easiest route is to ask an AI agent to do the update using the prompt below. You do not need to learn programming.

Each category's JSON file is a list of discoveries. An entry has this shape; the example explains the format and is **not a publishable article**:

```json
{
  "id": "a-unique-permanent-id",
  "title": "A memorable title",
  "category": "thinking-room",
  "opening": "A compelling opening grounded in a real subject.",
  "paragraphs": ["The explanation.", "The connection or takeaway."],
  "reflection": "A thoughtful question or reflection.",
  "readingTime": "1 min",
  "keywords": ["subject", "related idea"],
  "sources": [{"title": "Actual source title", "url": "https://example.org/actual-source"}],
  "visual": "thinking-room"
}
```

Use roughly 100–180 words across the opening, explanation, and reflection. Use original writing, read cited references, and label uncertainty. Never publish invented quotations or a reference that does not support the text. Keep existing `id` values unchanged: they are permanent URLs and saved-favourite identifiers.

After adding an article, the agent should rebuild, update the launch-count assertions and displayed counts deliberately, run tests, commit both content and generated pages, and push. The homepage introduction and preview counts are launch copy in `scripts/build.mjs`; update those if the library grows. Category definitions come from `content/categories.json`.

### Changing categories

Edit names, descriptions, accents, or symbols in `content/categories.json`, then rebuild. Retain category `id` values unless the agent also migrates every article and link. Adding another category needs a matching JSON file, a deliberate SVG motif in the generator, and updated tests; changing a description does not.

### Replacing an illustration

Replace `assets/cover-art.webp` with an optimized image of similar vertical proportions. Keep it local and verify its usage rights. The cover title remains real HTML text. Update `assets/ARTWORK.md` and the Sources page if the artwork's origin changes. The six symbolic category illustrations are SVG paths in `motif()` in `scripts/build.mjs`; changing them requires a rebuild. They are deliberately ornamental, not scientific evidence for individual articles.

## How to ask an AI agent to update Little Wonder

> Update https://github.com/melvinvarghese/Little-Wonder. Add one original, source-checked discovery about **[subject]** to **[collection]**. First read README.md and inspect the repository. Fetch reputable references and read them; keep claims within their evidence. Match the content JSON format and one-minute reading length. Keep every existing article ID and URL unchanged. Update counts and tests intentionally, regenerate pages with `npm run build`, and run `npm test` plus relevant browser checks. Preserve favourites, export/import, accessibility, reduced motion, privacy and the `/Little-Wonder/` Pages base path. Update research notes. Commit as Melvin Varghese <36334526+melvinvarghese@users.noreply.github.com>, push without force, and verify GitHub Pages deployment. Explain the change in simple English.

## For an agent or developer: build and test

There are **no runtime package dependencies**. Node's test runner handles core/content/build checks. Playwright and axe are development-only tools for real-browser and automated accessibility checks.

```sh
npm ci
npm run build
npm test
```

To preview locally:

```sh
npm run serve
# Open http://localhost:8000/
```

To reproduce browser checks under the project subpath, start this command from the repository's **parent directory**:

```sh
python3 -m http.server 8011
# The repository folder must be named Little-Wonder.
# Open http://localhost:8011/Little-Wonder/
```

In another terminal in the repository:

```sh
npx playwright install chromium
npm run test:browser
```

Tests use `http://localhost:8011/Little-Wonder/` by default. Set `TEST_URL` to a different served base if needed. They create a separate browser profile and do not touch real visitor favourites. `test-results/`, local logs, `node_modules/`, and temporary screenshots are ignored by Git.

Before publishing, run `git diff --check`, inspect changes, and commit both source and generated outputs. Never force-push. The record of checks actually performed is in [docs/TEST-RESULTS.md](docs/TEST-RESULTS.md).

## Known limits

- Favourites are browser-local, not a cloud backup. Export before clearing browser data, moving devices, or ending private browsing.
- Modern browsers serialize collection writes across tabs using Web Locks. Older browsers without that API re-read the latest data before each synchronous write; extremely simultaneous edits there remain last-write-wins. Export before managing a collection across many tabs.
- A raw recovery backup preserves damaged bytes but does not automatically repair them. An agent can inspect the downloaded file before you clear damaged browser data; a valid JSON collection can then be imported.
- Static reading and links work without JavaScript. Daily selection, surprise, filtering, sharing and saved collections need it. `file://` is not supported for interactive features; use HTTP hosting.
- Native sharing depends on the device. Clipboard denial reveals a selectable permanent link and never claims a copy succeeded.
- This is a responsive website, not an offline-installed app. A loaded page is readable; the next page needs its file from the host.
- External source pages can move. Titles, URLs and verification notes are retained for future checks.
- Automated accessibility checks do not prove full accessibility. See the test record for browser/device coverage and unperformed checks.

## Corrections and privacy

Every discovery links its references. Send corrections through this repository's Issues with the article title and a reliable supporting source. The privacy page explains browser storage and GitHub Pages hosting. No visitor analytics or advertising is integrated.
