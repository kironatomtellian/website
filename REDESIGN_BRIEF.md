# REDESIGN_BRIEF.md — proposed redesign for kironatomtellian.com

Phase 2 deliverable. No code. Concrete page-by-page motion and visual
proposals. Read this and push back before I start building.

---

## Scope (revised at user request)

| In scope                                            | Out of scope                                              |
| --------------------------------------------------- | --------------------------------------------------------- |
| Full **rebuild** of the public site                 | Replacing the CMS architecture                            |
| **Restyle** of the existing PHP + TinyMCE CMS UI    | The CMS's data model, authentication, or TinyMCE config   |
| English only                                        | German (`.de.php`) pages — left untouched on the server   |
| Refined motion, modern image pipeline, a11y, perf   | New features or new content                                |

---

## Architecture

```
                                                ┌─────────────────────┐
                                                │  Adobe Fonts        │
                                                │  Caslon Pro (kit)   │
                                                └──────────┬──────────┘
                                                           │ <link>
                          (build time)                     ▼
┌────────────────────┐   reads JSON  ┌──────────┐   serves   ┌─────────┐
│  Existing PHP CMS  │ ────────────▶ │  Astro 4 │ ─────────▶ │  Nginx  │ ───▶ kironatomtellian.com
│  /cms/ (TinyMCE)   │   via export  │  static  │  static    │  static │
│  + restyled UI     │   endpoint    │  build   │  HTML/CSS  │  files  │
└─────────┬──────────┘               └──────────┘            └─────────┘
          │
          │ "Publish to website" button
          ▼
   npm run build && rsync dist/ /var/www/public_html/
```

**Public site**: Astro 4 with `output: 'static'`. Pre-renders every page at
build time. Astro's `<Image />` generates AVIF + WebP + JPEG fallbacks at
multiple widths with blur-up. View Transitions enabled via Astro's
`<ClientRouter />`. ~0 KB of shipped JS for most pages; a tiny bundle
(~6 KB gzipped) only on pages that need lightbox / hover-preview /
schedule expand.

**CMS**: The existing `/cms/` directory keeps doing what it does. We replace
its CSS with the same tokens the public site uses, tighten button hierarchy,
fix the orphan `</span>` in the nav, and add two small things: an alt-text
field on gallery images (a11y) and a `Publish` button that POSTs to a tiny
PHP endpoint which runs `npm --prefix /var/www/website/apps/public run build`
and atomically swaps the new `dist/` into the public web root.

**Why not Next.js**: Adds a Node runtime at request time. Dad currently
serves static files; Astro static keeps that operational model intact.

**Why not vanilla PHP-rebuild**: We'd be rebuilding the templating, image
pipeline, view transitions, and image optimization by hand. Astro gives us
those for free.

---

## Design system

### Typography — Adobe Caslon Pro, one family

| Role             | Weight / style          | Size                                  | Line-height | Tracking  |
| ---------------- | ----------------------- | ------------------------------------- | ----------- | --------- |
| `display-xl`     | Caslon Pro Italic       | `clamp(3rem, 9vw, 7.5rem)`            | 0.95        | -0.02em   |
| `display-l`      | Caslon Pro Regular      | `clamp(2.25rem, 5vw, 4.25rem)`        | 1.05        | -0.015em  |
| `pull-quote`     | Caslon Pro Italic       | `clamp(1.5rem, 3vw, 2.75rem)`         | 1.25        | -0.01em   |
| `h1`             | Caslon Pro Regular      | `clamp(2rem, 4vw, 3rem)`              | 1.1         | -0.01em   |
| `h2`             | Caslon Pro Semibold     | `clamp(1.5rem, 3vw, 2.25rem)`         | 1.2         | -0.005em  |
| `h3`             | Caslon Pro Semibold     | `clamp(1.25rem, 2vw, 1.5rem)`         | 1.3         | 0         |
| `body`           | Caslon Pro Regular      | `1.125rem` (18px)                     | 1.65        | 0         |
| `small`          | Caslon Pro Regular      | `0.875rem` (14px)                     | 1.5         | 0         |
| `eyebrow`        | Caslon Pro Semibold     | `0.75rem` (12px)                      | 1           | 0.18em    |

Eyebrows are uppercase, tracked out — used for section labels ("NEXT CONCERTS",
"PRESS", "AUDIO & VIDEO"). They are the only typographic element that breaks
the "one family, hierarchy by size/weight/italic" rule, and even they use
Caslon — just with a different visual treatment.

Subsetting: Latin Extended-A only. Glyphs: a–z A–Z 0–9, `» «`, `–—`, accented
Latin (Müller, Strauß, ö, ä, ü, é, è, ä, etc.). Drops Cyrillic, Greek, CJK
that Adobe's kit ships by default. Target subsetted Caslon Regular: ~25 KB.

Italic is the *primary* display register — it's where Caslon does its best
work. The site's identity should feel italic-led.

### Color palette — warm editorial

| Token              | Value                          | Used for                                  |
| ------------------ | ------------------------------ | ----------------------------------------- |
| `--paper`          | `#F5F0E8`                      | Default page background. Warm off-white.  |
| `--ink`            | `#1A1714`                      | Body text on paper.                       |
| `--paper-deep`    | `#0E0C0A`                      | Dark sections (calendar, hero overlays).  |
| `--ink-light`     | `#E8DDD0`                      | Text on `--paper-deep`.                   |
| `--accent`         | `#8C6F47`                      | Antique brass. Used *sparingly*: hover underlines, next-concert badge, link affordance. |
| `--accent-soft`   | `#B89976`                      | Lighter brass for hover hints on dark.    |
| `--rule`           | `rgba(26, 23, 20, 0.12)`       | Hairline rules on paper.                  |
| `--rule-dark`     | `rgba(232, 221, 208, 0.16)`    | Hairlines on `--paper-deep`.              |
| `--muted`          | `rgba(26, 23, 20, 0.6)`        | Captions, dates, secondary text.          |
| `--muted-light`   | `rgba(232, 221, 208, 0.6)`     | Same role on dark.                        |

**Contrast check**:
- `--ink` on `--paper`: **13.6:1** (AAA body)
- `--ink-light` on `--paper-deep`: **12.8:1** (AAA body)
- `--accent` on `--paper`: **4.6:1** (AA large text, AA UI components; not used for body)

### Spacing scale (8px base)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 192 · 256`. Section vertical
padding defaults to **128px desktop / 64px mobile**, with the option to step
up to 192 for the hero and down to 64 between paired blocks. Reading column
width caps at **66ch** (~620px at 18px body) — the current site goes to ~50%
viewport on XL, which is too wide for editorial prose.

### Layout grid

12-column grid with a fluid gutter (`clamp(16px, 2vw, 32px)`). Reading column
spans cols 4–9 on desktop, 3–10 on tablet, full-width on mobile. Hero photos
break out of the grid (full-bleed). The hairline `--rule` divides major
sections at full-bleed width.

### Motion language

| Curve                                       | Use                                      | Duration |
| ------------------------------------------- | ---------------------------------------- | -------- |
| `cubic-bezier(0.22, 1, 0.36, 1)` (out-expo) | Default entry, scroll reveals            | 600ms    |
| `cubic-bezier(0.65, 0, 0.35, 1)` (in-out)   | Page (View Transition) cross-fades       | 500ms    |
| `cubic-bezier(0.4, 0, 0.2, 1)` (standard)   | Hover state transitions                  | 200ms    |
| `linear`                                    | Marquee / photo-strip auto-advance       | (steady) |

**No springs. No bounces. No scroll-jacking.** Every entry animation is
fade + small Y-translate (16–24px) over 600ms with `out-expo`. Hover states
are 200ms underline/opacity/color shifts. Page transitions are 500ms
cross-fades via the native View Transitions API (Chrome 126+, Safari 18+),
with a tiny progressive-enhancement shim for older browsers.

`prefers-reduced-motion: reduce` disables all entry/transition animations
and switches the photo-strip ticker to a static three-photo grid.

---

## Page-by-page proposals

### Home (`/`, was `index.en.php`)

**Hero**
- Full-bleed photo, `--paper-deep` letterboxed when image aspect doesn't match viewport.
- The name "Kiron Atom Tellian" enters as Caslon Pro Italic display-xl, fade-up over 800ms, ~250ms after first paint.
- "Pianist · Composer" subtitle (small, tracked +0.2em) appears 400ms later.
- A tiny down-chevron at bottom-center hints scrollability — no animated bounce; static, hover lifts it 4px.

**Press-quote hero cycle** (replaces the static three-quote section)
- One quote at a time, set as `pull-quote` italic, max 66ch wide.
- The publication name is set as an `eyebrow` *above* the quote in `--accent`.
- The date sits as `small` `--muted` below.
- The » and « are oversized to `display-l`, set in `--accent-soft`, positioned as decorative outdents flanking the quote.
- Auto-cycle: 9s display, 1.2s cross-fade. Pauses on hover. Pauses when
  `prefers-reduced-motion` is set (then shows the first quote statically).
- A small "1 / 4" indicator in the corner, with dot pagination on click.

**Bio teaser**
- Three short paragraphs (already in the current site) below the quote hero.
- First paragraph gets a CSS `::first-letter` drop cap in `display-l`.
- "Read full biography →" link with `--accent` underline-on-hover (a 200ms
  underline-thickness animation from 1px to 2px, no color change).

**Next Concerts** (replaces the three static cards)
- A single **featured next concert** card spanning the full reading column: large date, days-until counter in `--accent`, programme, venue, ticket link as a button-style affordance.
- Below it: a **quiet list** of the next 3–5 concerts as text rows (no card chrome) — date · venue · programme. Each row hovers to underline.
- "View full schedule →" at the bottom.
- No map. (Considered it; decided against — adds JS weight and decorative noise for limited info gain.)

**Audio & Video grid**
- 4 featured items (latest, curated in CMS), 2-column on desktop, 1-column on mobile.
- Each card: large thumbnail with the title below in `h3`.
- **Hover-to-preview**: where the source is a YouTube video and the user is *not* on a touch device, hover swaps the static thumbnail for an `<img>` of YouTube's `mqdefault.jpg` *animated* via the `start.jpg` → `1.jpg` → `2.jpg` → `3.jpg` storyboard frames cycling at 600ms intervals. This avoids embedding YouTube's iframe (no JS, no cookies, no perf hit) while still feeling alive.
- Click → opens the YouTube URL in a new tab (current behavior preserved).
- Scroll reveal: each card fades up with 120ms stagger between siblings.

**Photo ticker** (replaces the broken photo strip)
- A horizontal marquee of all gallery photos at a constant 40px/s scroll, infinite loop.
- Pauses on hover.
- Each photo is a thumbnail (240px tall, AVIF, ~12 KB each).
- Click → opens the gallery page at the corresponding photo.
- `prefers-reduced-motion`: degrades to a static 5-photo grid linking to gallery.
- Below the strip: "© Photos Shervin Lainez" set as `small` `--muted-light`.

**Footer**
- Restyled but functionally identical: "Contact" heading, YCA reps (Christina Baker, Mic Herring), kiron@ email, Imprint link, YouTube icon.

### Biography (`/about`, was `about.en.php`)

- Hero photo with title "Biography" as `display-l` overlaid bottom-left.
- Title fades up on first paint.
- **Pull-quote treatment**: the four interleaved press quotes get the same `pull-quote` italic treatment as the home cycle — publication eyebrow above, italic quote, date below. The » « marks are set as oversized `--accent-soft` outdents.
- Each quote+paragraph pair enters via IntersectionObserver: quote first, paragraphs follow with 120ms stagger.
- First bio paragraph gets a drop cap.
- "Press →" link at the bottom.

### Press (`/press`, was `press.en.php`)

- Hero with image and title "Press".
- Long single column of press excerpts as **proper pull quotes** — no more `<h2>` for the quote body. Each excerpt is a `<blockquote>` with `<cite>` for the publication and a `<time>` for the date.
- Reveal: each `<blockquote>` fades up at 32px below viewport, 600ms, out-expo. No all-at-once reveal like the current inline script — individual stagger.
- The » « guillemet marks: oversized, italic, `--accent-soft`, decoratively outdented to the left and right.
- Inter-quote spacing: 96px desktop / 48px mobile, with a hairline `--rule` divider every fourth quote.
- "Biography →" CTA at the bottom (current page already has this).

### Schedule (`/schedule`, was `schedule.en.php`)

- Hero with image and title "Schedule".
- **Featured next concert** card at top (same primitive as the home page) with a days-until counter in `--accent`.
- Below it, the rest of upcoming concerts grouped by **month**:
  - Month header as `display-l` italic in `--accent`, e.g. *"May 2026"*.
  - Each entry: date (large), venue, programme, "Details & tickets →" link.
  - Hover: row indents 8px, programme picks up `--accent` underline.
- No card chrome on the non-featured entries — pure type, hairlines between, the typography is the architecture.
- Optional expand for entries with extended programme details (collaborator names, full piece list) — caret toggles open with smooth height transition, `aria-expanded` mirrored.

### Schedule Archive (`/schedule-archive`, was `schedule-archive.en.php`)

- Same primitive as Schedule but reverse-chronological.
- **Year accordion**: each year collapses by default (except the most recent), opens on click with smooth height transition. Year labels are `display-l` italic in `--accent`.
- A quiet right-rail of year jump-links on desktop (sticky), hidden on mobile.
- Past events have no "tickets" link; they instead optionally show a media link (recording / press) if the CMS has one attached.

### Media (`/media`, was `media.en.php`)

- Hero with image and title "Media".
- Same hover-to-preview treatment as the home grid (YouTube storyboard frames, no embeds).
- Grid: 2-column desktop, 1-column mobile.
- Each card's expandable details (programme list, prize list) animate open with a smooth height transition; chevron rotates 180° on open; `aria-expanded` mirrored.
- Scroll reveal: 100ms stagger.
- External sources (Instagram, ORF, newspaper articles) handled identically to YouTube — they just open in new tab on click; for non-YouTube sources hover doesn't animate (no storyboard available), it gets a subtle zoom (1.0 → 1.02) on hover instead.

### Gallery (`/gallery`, was `gallery.en.php`)

- Hero-less. Title "Gallery" centered, `display-l` italic.
- **Real masonry layout** via CSS `column-count` (with `column-gap: 24px`). Astro generates thumbnails at multiple widths; no rigid grid.
- Each photo: blur-up placeholder (32px LQIP) → AVIF + WebP, sized via `srcset`.
- Click → opens a lightbox with:
  - Smooth 95% → 100% scale-in on entry (300ms out-expo).
  - Keyboard nav: ← / → between photos, ESC to close, focus trap inside.
  - "High Res" download link in bottom-right corner, set as `small` with the
    download icon.
  - Caption (optional, from CMS) below the photo as `small` `--muted-light`.
- Drop the duplicate "Photos" nav link — only "Gallery" remains.

### Contact / Imprint (`/contact`, was `contact.en.php`)

- Touched lightly for visual consistency only. New typography and color
  tokens; structure preserved; legal copy untouched.

### Shared nav

Reordered, deduplicated:

```
Biography  ·  Press  ·  Schedule  ·  Media  ·  Gallery
```

Site title remains "Kiron Atom Tellian" linking to home. Nav is fixed-top but
**translucent with a backdrop blur** instead of solid `bg-dark` — lets the
hero photo breathe through. Becomes solid `--paper-deep` on scroll past 100px.

### CMS restyle (`/cms/*`)

- Page background → `--paper`. Body type → Caslon Pro Regular.
- Nav: same translucent treatment, but `--ink` on `--paper` (light theme appropriate for editing).
- Buttons: replace Bootstrap's `btn btn-secondary btn-lg` blue with `--ink` filled / `--accent` outlined per role hierarchy:
  - Primary action (Save, Publish): filled `--ink`
  - Secondary action (Edit, Edit photo): outlined `--ink`
  - Destructive (Delete): outlined `--accent` *italic* "Delete" label, with a confirm modal
- TinyMCE skin: replace its default with a custom skin matching the design tokens. Set the default font in the editor to Caslon Pro so what you see in the editor matches what ships.
- Calendar entries in the admin: each entry is a `--rule` divided row instead of a Bootstrap card; current numeric IDs (cadetblue) become small `--muted`. Edit/Publish/Archive buttons become icon-only with tooltips.
- New: **Alt-text field** on every gallery image and media thumbnail. Required on save (with a clear validation message). Existing images get a back-fill prompt on next edit.
- New: **"Publish to website"** button in the CMS header. POSTs to a tiny `publish.php` that runs `npm --prefix /var/www/website/apps/public run build` and atomically swaps `dist/` into the public root. Shows a 5–10s "Publishing…" state and a success toast.
- Orphan `</span>` after the Logout link removed.
- TinyMCE keeps doing what it does — no editor-feature changes.

---

## Image pipeline

| Source                                | Output                                                |
| ------------------------------------- | ----------------------------------------------------- |
| `cms/uploads/gallery/*.jpg`           | `gallery-<id>-{390,768,1280,1920,2560}w.{avif,webp,jpg}` |
| `cms/uploads/images/*.jpg|jpeg|png|webp` | `media-<id>-{390,768,1280}w.{avif,webp,jpg}`         |
| `images/2025/*.jpg`                   | `hero-<slug>-{390,768,1280,1920,2560}w.{avif,webp,jpg}` |

- LQIP: 32px blurred placeholder inlined as a `background-image` `data:` URL on the wrapper. Real image fades in (300ms) when decoded.
- Astro's `<Image />` component handles all of this declaratively. We just author `<Image src={...} widths={[...]} formats={['avif','webp','jpg']} sizes="..." />`.
- All `<img>` get intrinsic `width` and `height` → CLS = 0.
- All photos get real, descriptive `alt` text from the CMS field. Decorative photos can opt in to `alt=""` explicitly.

---

## Accessibility — WCAG 2.1 AA

- Skip link at the top of every page.
- Visible focus: `2px solid var(--accent)` with `2px` offset.
- Lightbox: ARIA `role="dialog"`, `aria-modal="true"`, focus trap, ESC closes, focus restores to the originating thumbnail.
- Schedule/Media expand: `<button aria-expanded>` toggling sibling `[hidden]`.
- Press quotes: `<blockquote><p>…</p><footer><cite>…</cite> · <time>…</time></footer></blockquote>` — proper semantics, screen readers announce the publication.
- Viewport meta: `width=device-width, initial-scale=1` only. **Drop the `maximum-scale=1`** — current site violates WCAG 1.4.4.
- Color contrast: every text/background pair audited; nothing under 4.5:1 except large display text against accent backgrounds (always ≥ 3:1).
- `lang="en"` declared correctly on every page (fixes the `lang="de"` bug on the current home).
- Real alt text on every photo, sourced from the new CMS field.

---

## Performance budget

| Metric                   | Target (Slow 4G, cold)         | Current site (est.) |
| ------------------------ | ------------------------------ | -------------------- |
| LCP                      | ≤ 1.5 s                        | ~2.5 s (TypeKit blocks) |
| CLS                      | 0                              | unknown, likely >0   |
| TBT                      | ≤ 50 ms                        | unknown              |
| Total transferred        | ≤ 200 KB excl. images          | ~300 KB excl. images |
| JS shipped on home       | ≤ 6 KB gzipped                 | full kat.bundle.js   |
| Caslon Pro Regular       | ≤ 25 KB woff2 (subsetted)      | full typekit kit     |

Mechanisms:
- Self-hosted, subsetted Caslon Pro + `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `<head>`.
- Critical CSS inlined in `<head>` of every page via Astro's `inlineStylesheets: 'always'` for small sheets.
- Non-critical JS deferred. Lightbox JS loaded only on `/gallery`. Hover-preview JS loaded only on `/media` and `/`.
- All images lazy-loaded except above-the-fold hero (which gets `fetchpriority="high"`).
- View Transitions handled by browser; small (~2 KB) shim only for unsupported browsers.

---

## Dark mode — explicit decision

**No dark-mode toggle.**

Rationale: a concert pianist's identity is editorial. The visual reference
set — Carnegie Hall, Wigmore Hall, the Berlin Philharmonic, individual
artist sites like Igor Levit's, Pierre-Laurent Aimard's, Yuja Wang's — is
overwhelmingly **single-palette warm paper**. Dark mode is a software-product
convention that signals "tech tool", not "performer". The "concert-hall
darkness" metaphor doesn't quite land for a personal site.

Internal dark sections (`--paper-deep`) still appear — they're a
typographic rhythm device, not a user-toggleable mode. They show up
where the design earns them: the hero overlay, the calendar pinned card,
the photo-ticker bar.

If the user wants to revisit this later (e.g. add a `prefers-color-scheme`
auto-switch), the token system supports it without rework — every color is
already a CSS variable. But it's not in this rework.

---

## Repository layout

```
/home/user/website/
├── apps/
│   ├── public/                    # Astro 4 project, builds → apps/public/dist/
│   │   ├── astro.config.mjs
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── layouts/Layout.astro
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   ├── about.astro
│   │   │   │   ├── press.astro
│   │   │   │   ├── schedule.astro
│   │   │   │   ├── schedule-archive.astro
│   │   │   │   ├── media.astro
│   │   │   │   ├── gallery.astro
│   │   │   │   └── contact.astro
│   │   │   ├── components/        # Nav, Footer, PressQuote, ConcertCard, MediaCard, PhotoTicker, Lightbox, …
│   │   │   ├── styles/            # tokens.css, base.css, type.css, motion.css
│   │   │   └── lib/cms.ts         # fetches CMS JSON at build time
│   │   └── public/                # static assets that bypass Astro processing
│   └── cms/                       # existing PHP CMS + restyle
│       ├── (existing PHP files, untouched logic)
│       ├── assets/css/cms.css     # NEW — replaces current CMS styling
│       ├── assets/css/tinymce-skin/  # NEW — custom skin
│       └── publish.php            # NEW — triggers rebuild
├── packages/
│   └── tokens/                    # shared CSS variables consumed by both apps
│       └── tokens.css
├── tools/
│   ├── build-images.mjs           # one-off pre-processing if needed
│   └── deploy.sh                  # called by /cms/publish.php
├── source-snapshot/               # existing — the audit's input
├── DESIGN_AUDIT.md
├── REDESIGN_BRIEF.md              # this file
├── HANDOFF.md                     # written at end
└── CHANGES.md                     # written at end
```

---

## Build, publish, rollback

**Local dev:**
```
cd apps/public && npm install && npm run dev   # http://localhost:4321
cd apps/cms    && php -S localhost:8080         # http://localhost:8080
```

**Production build:**
```
cd apps/public && npm run build
# output: apps/public/dist/
```

**Publish to live site:**
- Kiron presses "Publish to website" in the CMS.
- `cms/publish.php` runs `tools/deploy.sh` which:
  1. Runs `npm --prefix /var/www/website/apps/public run build`
  2. Copies `dist/` to `/var/www/public_html/.next`
  3. Atomically renames `public_html` ↔ `public_html.prev`
  4. Sends a success/failure response to the CMS UI

**Rollback (5 minutes):**
- `mv /var/www/public_html /var/www/public_html.broken`
- `mv /var/www/public_html.prev /var/www/public_html`
- Hard refresh.

This is documented in HANDOFF.md when the project ships.

---

## What I want from you before I start building

I'm not going to ask permission for every aesthetic choice — you said
"do whatever you think is most elegant, most beautiful" and I'm taking
you up on that. But I do need confirmation on these structural items:

1. **Astro static + restyled PHP CMS — yes?** This is the architectural
   commitment. Everything downstream assumes it.
2. **Adobe Fonts kit access** — can you log in to Adobe Fonts, add **Adobe
   Caslon Pro** (all weights, plus Italic) to your kit `ysr5edr` if it's
   not already there, and confirm? Alternative: tell me and I'll pivot to
   a self-hosted Caslon revival as fallback.
3. **No dark mode** — confirm you're OK with the argument above.
4. **Hover-to-preview via YouTube storyboard frames** (not iframe embeds)
   — sound good? Trade-off: lighter and faster, but the preview is a
   cycling still rather than actual video motion.
5. **CMS "Publish to website" button** — confirm the rebuild-on-publish
   model is acceptable (vs. live data fetched at request time). Trade-off:
   site is 100% static (fast, no Node at request, totally cacheable) but
   content updates require a 10–30s build before they appear publicly.

Once these are confirmed, I'll start Phase 3 — building the home page
end-to-end and showing it to you locally before rolling out the system to
the rest of the pages.
