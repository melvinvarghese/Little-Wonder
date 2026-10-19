# Little Wonder: pocket atlas redesign

Approved direction: a pocket naturalist’s atlas with a custom tiny-window logo, mineral blue, marigold and vermilion; an asymmetric open folio; and an original specimen plate synchronized with the daily discovery. This is a bounded visual overhaul of the existing static templates, not a new application architecture.

## The idea

Little Wonder’s sixty one-minute discoveries become illustrated leaves in a personal atlas. The daily leaf is visible before it is opened. A little open window is the identity: looking closely opens a larger world.

The subject-specific material is the sixty launch discoveries, their individual questions, their six collections, their permanent page numbers, local-date daily selection, source links, and the reader’s private saved collection. No invented testimonials, streaks, subscriptions or product features.

## Visual system

- Mineral blue `#164b68`: book cloth, navigation and ink.
- Deep ink `#12384c`: body text.
- Mist `#eaf0ef`: illustration paper and page ground.
- Leaf white `#f8f9f3`: reading surface.
- Marigold `#efb632`: a daily ribbon and the window’s sun.
- Vermilion `#bc3d2a`: window shutter and sparse annotations.
- Lora: literary display and reading text; Karla: navigation, controls and annotations. Both locally hosted with their licenses.

The homepage is not a text-plus-floating-book landing page. It is a bound spread: a compact introductory left leaf, a larger illustrated daily right leaf, followed by a cabinet index with illustrated collection tabs. The daily title, plate, category and leaf number change together. Reader pages pair an illustrated margin with an uncluttered reading column. The shelf is a two-column illustrated index on desktop, a single column on phones. Information and empty pages use the same ink and paper system.

```text
Desktop
┌ tiny window + wordmark ───────── existing navigation ┐
│  a minute for curiosity  ║ today's discovery ribbon  │
│  An atlas for            ║                          │
│  the curious.            ║     daily specimen       │
│  short introduction      ║                          │
│  Open today's wonder     ║ title / collection / leaf│
└─────────────────────────╨──────────────────────────┘
  collections introduction | illustrated cabinet index

Phone: compact header; introduction and action; daily plate;
collection index; surprise control. No horizontal page turns.
```

## What changes, what does not

Retire the generic star emblem, green cloth-cover rendering, repeated category icons as hero art, system-only type, and centered generic page introductions. Preserve all 75 page URLs, navigation labels, article content and sources, existing data attributes and anchor IDs, deterministic daily sequence, search/filter/reset, surprise selection, save/remove/export/import/recovery, share fallbacks, local storage keys, no-account privacy model, no-JavaScript reading, visible focus, reduced motion and accessible labels.

No framework migration or new production dependencies. The existing build script remains the source of all static HTML. Artwork and fonts are local files; browsing does not call an image or font service. Generated art is interpretive, not evidence.

## Review gate

Work on local branch `redesign/pocket-atlas`. Commit checkpoints locally. Run the static/unit suite, browser/recovery/concurrency checks, and new daily-plate synchronization checks. Inspect desktop and phone previews. Nothing is pushed or deployed without the owner’s explicit review and approval.
