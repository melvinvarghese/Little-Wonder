# Little Wonder: launch checks

## What passed

The site was built and served locally under **`/Little-Wonder/`**, not just the server root. The final test run completed with no failing checks:

- **8 Node tests passed.** These check the daily selector, local title/keyword search, category-scoped random selection without immediate repeats, strict import validation, preserved unknown favourites, launch content completeness, static output, and local link/asset paths.
- **19 browser checks passed** in Chromium through Playwright. These exercised the actual HTML and browser JavaScript rather than a screenshot or a component mock.
- **4 additional browser regressions passed:** clear-storage updates across tabs, exact raw recovery backup of corrupted data without replacing it, nested custom-404 routing, and simultaneous two-tab saves retaining both favourites.
- `npm ci` completed from the committed dependency lock. Build generation completed. `node --check` passed for the browser application and page generator. `git diff --check` reported no whitespace errors.

## The browser flows that were exercised

All **75 generated HTML pages** returned HTTP 200 under the project base path, including all 60 directly opened discovery URLs. Refreshing an article retained the same article. The book-opening control, close control, previous/next links and Reading Shelf navigation worked.

Daily discovery stayed stable on refresh. A controlled browser clock crossed local midnight, changed the featured article, and changed it again after a simulated later visibility event. Surprise selection stayed within the chosen category and avoided the preceding selection.

Search, title/keyword matching, collection filters, no-results states and reset worked. Favourites saved, survived refresh, appeared in the collection, exported to the expected JSON shape, removed and imported with the correct addition count. Invalid imports did not change saved data. Unknown identifiers survived. Corrupt storage remained byte-for-byte intact; a recovery download preserved its original bytes. A forced browser-storage write failure did not claim a save succeeded. Simultaneous modern-browser tab saves preserved both selections.

The share tests forced native-share success/cancellation, clipboard success and clipboard rejection. Success messages appeared only after successful promises. Rejection exposed a selectable permanent URL. These are deterministic browser-capability tests, not an assertion that a Linux test machine opened a phone's native sharing sheet.

Invalid interactive article JSON left the static article readable with sources. Disabling JavaScript left articles and the entire 60-entry shelf readable.

## Accessibility and phone layouts

Automated axe scans for **WCAG 2.1 A/AA** returned zero violations on the homepage, shelf, collection index, favourites page, privacy page and an individual reading page from each of the six collections. Keyboard tests reached the skip link, focused main content, used visible focus on the opening control and entered a reading page. Reduced-motion testing removed the cover transition and reading animation while leaving navigation functional.

The main layouts were checked at viewport widths **320, 375, 390, 768 and 1366 CSS pixels**. No horizontal document overflow or clipped book was found. Full-page desktop and phone screenshots were visually reviewed, including a complete mobile reading page. The cover artwork loaded successfully. Dynamic shelf results retain the same original SVG engravings as the static entries.

A lightweight HTML-parser audit covered all 75 pages: each had one main heading, no duplicate element IDs, and alternative-text attributes for images. This was a structure audit, **not** a full W3C/Nu HTML conformance certification; no standalone HTML validator was installed.

## Content and research

The launch includes **60 unique articles, six collections and ten articles per collection**. The complete reading text ranges from **130 to 179 words**. Every entry has its required fields, a unique ID/title/opening, keywords and at least one HTTPS source with a title. The library contains **72 distinct source URLs**. Automated checks found no duplicated title, opening or identifier.

Research was split by collection. The linked institutional, scholarly and primary-reference pages were opened or fetched, not accepted from search snippets alone. `research/` retains the evidence notes, qualifications and source links. Editorial review narrowed claims where the evidence was limited and corrected two mathematical ambiguities: Simpson’s paradox now refers to one treatment's subgroup/overall reversal, and Benford's illustrative growth explicitly assumes a steady percentage rate.

## Problems found and fixed

Testing caught an incorrect import-addition message, an overriding accessible cover label, insufficient contrast in the reflection heading, a nested-404 base-path issue, stale state after another tab cleared storage, and a missing raw-data recovery path. Each was fixed, with regression checks where applicable. The final complete browser suite passed after those fixes. Some early browser assertions also needed to wait for asynchronous Web Lock saves instead of checking state immediately; the test harness was corrected without removing the checks.

## What this does not prove

No physical Android phone, iPhone, tablet, Safari, Firefox or screen reader was available for this run. Phone-size Chromium checks are not a claim of physical-device testing. Automated accessibility checks do not certify complete accessibility. No formal Lighthouse performance score, exhaustive third-party source-link uptime test or W3C validation claim is made.

Favourites remain browser-local. Browsers without Web Locks use a fresh synchronous read/write and can still be last-write-wins during extremely simultaneous legacy-browser edits. Raw recovery preserves damaged data but does not automatically repair it. Source sites can change later. The README explains these limitations and maintenance steps.

## Reproducing the checks

Read the README for local serving instructions. From the repository, run:

```sh
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:browser
```

The default browser-test server is `http://localhost:8011/Little-Wonder/`; it must already be running. Tests use isolated browser storage. Results and local logs are ignored by Git.

## Pocket-atlas redesign verification

The unpushed `redesign/pocket-atlas` branch preserves the 75 public HTML routes and all 60 article identifiers. The homepage, shelf, category index, saved collection, information pages and readers now share the tiny-window identity and pocket-atlas styling. This section supersedes the launch-design references above to a cover and category SVG engravings: entries now use article-specific local specimen plates.

After the final implementation, `npm test` passed all 8 checks. `npm run test:browser` passed all 19 interaction/layout/accessibility checks, all three recovery checks, the simultaneous two-tab-save check, and all three new atlas checks. Axe found zero WCAG 2.1 AA violations on the tested templates; this is not complete accessibility certification.

The atlas test crosses midnight in Asia/Kolkata using the running 30-second timer, then verifies the visibility refresh separately. Image, title, category, padded leaf number and link remain synchronized. Reader art belongs to the current article. The static homepage remains meaningful without JavaScript.

All 60 unique local WebP plates were verified at 600 × 360 pixels and below 100 KB. Visually reviewed crop boundaries avoid assuming that generated sheets have equal rows. A read-only independent review found no important production defect; its observation about timer-test coverage was addressed. Desktop (1440 px), tablet (768 px) and phone (390 px) previews were captured with `node tests/preview.mjs` in Git-ignored `test-results/atlas-preview/` and visually inspected. Fonts and artwork load locally; no new runtime dependency or remote font/image service was introduced.

Only local commits and a temporary review server were created. Nothing was pushed or deployed to GitHub Pages. Publication requires the owner's explicit approval after preview review.
