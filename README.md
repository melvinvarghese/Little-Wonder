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
## Pocket-atlas review

The redesign rationale is in `docs/ATLAS-DESIGN.md`. `npm run test:browser` includes the daily specimen/title/category/number/link checks, including local-midnight timer rollover in Asia/Kolkata and no-JavaScript fallback. `node tests/preview.mjs` captures desktop, tablet and phone previews in the Git-ignored `test-results/atlas-preview/` folder. No production deployment is part of the redesign review.
