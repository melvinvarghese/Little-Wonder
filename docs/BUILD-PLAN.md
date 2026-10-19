# Little Wonder implementation plan

## Approved brief
Build the complete free, English-language literary discovery website described in the owner's master request. The owner explicitly authorizes autonomous implementation, commits, pushes and publication, and requests milestone commits. Preserve the repository history. Its only initial file is README.md; main already publishes through GitHub Pages from the repository root.

## Architecture and design
Use plain HTML, CSS and browser JavaScript with a dependency-free Node static-page generator. Keep editable articles in six JSON files under content/. Generate real HTML article and category pages at the repository root paths, so links work without JavaScript and on refresh. Commit generated pages because the existing branch-based Pages setup needs no workflow or service. All links are document-relative; production base is /Little-Wonder/.

Palette: paper #f5f0e5, forest #183e33, ink #292d27, gold #9b753c, parchment #e9e0cd. Georgia/Palatino book typography and system sans-serif controls. An illustrated dark-green cloth book is the focal point; surrounding interface remains quiet. The reader is a narrow ivory leaf, with an ornamental category illustration and readable sources. CSS page-turn transition only enhances normal navigation. Reduced motion removes it.

## Milestones
1. Write failing Node tests for daily selection, search/filtering, nonrepeating random selection and validated portable favourites. Implement those helpers, run tests and commit.
2. Build the static generator, book-cover homepage, shelf, six collections, article reader, informational pages and browser interactions. Test generated routes and document-relative assets. Commit working structure.
3. Research and source-check ten original discoveries in each collection in parallel. Integrate 60 articles, validate completeness and rebuild. Commit launch library.
4. Test actual browser flows, desktop/mobile geometry, reduced motion, storage failures, sharing fallbacks, export/import, console errors, accessibility and static links. Independent code review and fixes. Document real test results and maintenance. Commit and push.
5. Inspect GitHub deployment and live pages; report verified URL and exact commit. Capture the publicly deployed homepage.

## Interfaces
Each article: id, title, category, opening, paragraphs[], reflection, readingTime, keywords[], sources[{title,url}], visual. Category slugs are thinking-room, between-the-lines, curious-past, natures-secrets, beyond-obvious, unanswered.

Core module assets/core.js exports dailyArticle(articles,date), filterArticles(articles,query,category), randomArticle(articles,previousId,category,rng), parseCollection(value), mergeCollection(existing,incoming). Storage uses a versioned JSON object and preserves unknown IDs. Invalid storage is never overwritten silently. Invalid imports fail without altering current favourites.

## Review focus
- Browser storage blocked, malformed, or containing IDs from an earlier collection: show clear recovery guidance and avoid silent loss.
- Same local calendar date across time zones and daylight-saving transitions must use the same day index; update after local midnight and when tab becomes visible.
- Clipboard rejection/native share cancellation must not produce false success feedback.
- Static assets and deep routes must work beneath /Little-Wonder/, including no-JavaScript reading.
- Article text and imported files are untrusted input; escape generated HTML, validate schema/size and avoid runtime HTML injection.

## Verification ledger
Initial inspection: admin permission; main has one README and no application; existing Pages legacy build from main root with HTTPS. No unrelated files to preserve beyond repository history.
