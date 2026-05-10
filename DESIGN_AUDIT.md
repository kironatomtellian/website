# DESIGN_AUDIT.md — current state of kironatomtellian.com

Audit based on saved HTML snapshots in `source-snapshot/`. Eight public English
pages and four CMS admin pages were captured. The stylesheet (in the Typekit
kit `ysr5edr`) and `kat.bundle.js` were not provided, so font specifics and
JS behaviors are inferred from rendered HTML markup and class names.

---

## Tech stack (inferred from markup)

| Layer            | What's there                                              |
| ---------------- | --------------------------------------------------------- |
| Front-end CSS    | **Bootstrap 5** (`data-bs-theme`, `data-bs-toggle`, `col-sm-6 col-lg-4`, `navbar-expand-lg`, utility classes `bg-dark text-white fs-1 ps-md-5 mt-5 rounded-3`) |
| Icon set         | Font Awesome (`fa-solid fa-chevron-down`)                 |
| Web fonts        | **Adobe Fonts / Typekit** kit `ysr5edr` (one `<link>` blocking render) |
| Custom JS        | `./public/assets/js/kat.bundle.js` (single bundle, top of `<head>`, blocking) |
| CMS              | Custom PHP + **TinyMCE** at `/cms/` — Calendar, Long CV, Short CV, Press, Media, Gallery. Reads/writes to `/cms/uploads/{gallery,images}/`. Self-contained; not in scope for this rework. |
| Server runtime   | PHP (file extensions `.en.php`, `.de.php`)                |

The current setup is **page-per-route, no SPA, no build pipeline**. Each PHP
page is fully server-rendered with includes for the nav and footer (inferred —
nav/footer markup is byte-identical across the eight pages).

---

## Typography system (as-shipped)

The user described the typeface as "Adobe Caslon Pro." What the HTML actually
uses, inline, is **Sumana** — a Google/Latin serif — for every display heading:

```html
<h1 style="letter-spacing: -0.02em; font-family: Sumana; font-size: 8vw;">…</h1>
```

The body inherits whatever the Typekit kit `ysr5edr` defines. Without the
kit's CSS I can't confirm the body face, but given the user's recollection it's
very likely **Adobe Caslon Pro** (or a Caslon sibling like Caslon Text).

| Role                              | Family                | Size                 | Notes                                                  |
| --------------------------------- | --------------------- | -------------------- | ------------------------------------------------------ |
| Hero / page-title display         | `Sumana`              | `8vw` desktop, `11vw` mobile, `6.5vw` ≥md | Inline on every page hero. Letter-spacing −0.02em.     |
| Section heading ("Image Gallery", "Audio & Video", "Next Concerts") | `Sumana` | `100%–260%` body-relative | Centered, mb-5.                                        |
| Pull-quote heading                | inherits (Caslon?)    | inline `font-size: 24pt`, `<strong>` | `<h2>` with inline 24pt span. Used in bio + press.     |
| Publication name                  | inherits              | inline `font-size: 18pt` | Plain `<span>`, optional `<strong>`, optional `<a>`.   |
| Quote date                        | inherits, italic      | inline `font-size: 18pt`, `<em>` | One line below the quote.                              |
| Body paragraph                    | inherits              | Bootstrap default (~1rem) | Justified by default browser, no explicit leading.     |
| Footer "Contact"                  | inherits              | Bootstrap `fs-1`     | Larger than body, no other treatment.                  |

**Problems with the type system as-is:**
- `font-size` in `pt` mixed with `vw` mixed with Bootstrap classes mixed with body inheritance. No single scale.
- Same visual role (publication name) marked up three different ways across pages — sometimes `<span>`, sometimes `<strong>`, sometimes wrapped in `<a>`.
- Quote markup uses `<h2>` for the *text* of the quote — turning the most important typographic element into a heading purely for sizing. No semantic separation of quote vs. attribution.
- Sumana is a fine Latin serif but it doesn't pair naturally with Caslon; both are humanist serifs and they fight on close inspection. If the user's intent is a Caslon-led identity, Sumana is doing the heading work that Caslon Display / Caslon variants should be doing.
- Typekit kit is render-blocking, not subsetted, and re-fetched on every page (no `font-display: swap`, no preload).

---

## Color palette (extracted from inline styles + Bootstrap defaults)

| Hex         | Role                                          | Where it's used                              |
| ----------- | --------------------------------------------- | -------------------------------------------- |
| `#000000`   | Deep black                                    | `<main class="main bg-black">` on home       |
| `#212529`   | Bootstrap `bg-dark`                           | Navbar, dark sections, calendar entries, footer body, gallery & press & schedule page bodies |
| `#ffffff`   | White                                         | Calendar wrapper bg, biography section bg, body text on dark |
| `#f0f0f0`   | Off-white                                     | Hero page-title text on Media / Schedule / Previous Events |
| `#2f4858`   | Petrol blue                                   | 1px bottom border under hero photos (about, press) |
| `#908493`   | Muted mauve-grey                              | Media-card chevron-down toggle (`<i class="fa-solid fa-chevron-down">`) |
| `cadetblue` | CSS keyword                                   | CMS-only: small index numbers on calendar entries |

The public site is **light-and-dark alternating editorial**: white sections
holding biography prose, dark sections holding calendar entries and the hero
nav. No pure brand accent color exists. There is no defined warm/cool tone;
the whites are pure `#fff`, the darks are Bootstrap defaults.

**Notable absences:**
- No semantic color tokens. Everything is inline `bg-dark` / `bg-white` / `bg-black` Bootstrap utilities.
- No hover/active/focus color states defined for links beyond Bootstrap defaults — most footer links use `.text-decoration-none` but have no custom focus ring.

---

## Spacing & layout rhythm

- **Container model**: full-bleed `container-fluid` for heroes and footer; the inner content sits inside a Bootstrap 12-col row with gutter columns flanking it: `col-1 col-md-2 col-xl-3` empty gutters and `col-10 col-md-8 col-xl-6` content. This creates a tight reading column on large screens (50% width at xl) but a very full-width feel on mobile (83% width).
- **Vertical rhythm**: ad-hoc — `mt-5`, `pt-5`, `pb-5`, `mb-3`, with occasional inline `min-height: 20vh` or `min-height: 0vh` (sic). No baseline grid, no consistent section padding.
- **Navbar**: `fixed-top`, dark, ~70–74px tall (`padding-top: 70px` on `<main>` in some pages, `74px` in others — inconsistent).
- **Hero pattern** (repeated on about, press, media, schedule, schedule-archive): full-bleed photo with a page-title `<h1>` positioned absolutely over it at `right: 10%; bottom: 10%` (about/press) or `left: 6%; top: 80%` (media/schedule/archive). Mobile and desktop versions of the title use two separate `<h1>` blocks gated by `d-block d-md-none` / `d-none d-md-block` rather than a single responsive style.

---

## Per-page audit

For each page: structure, what works, what's static-feeling.

### Home (`index.en.php`)
**Structure (top to bottom):**
1. Fixed dark navbar with site name + 7 nav items (note: "Photos" and "Gallery" both point to `gallery.en.php` — duplicate).
2. Hero block: `<h1 class="title">Kiron Atom Tellian</h1>`, subtitle "Pianist | Composer", below it an `<img id="_DSC5163" src="">` — **the hero image has an empty `src` attribute**, so the hero photo currently does not load on first paint. The visible hero photo `images/2025/4_vor_dem_klavier.jpg` is in a commented-out block.
3. Bio teaser section on white background — three press quotes interleaved with two short biographical paragraphs, then a "Biography…" button.
4. Mid-page image: `images/2025/2_auf_klaviatur_liegend.jpg`.
5. "Next Concerts" block: one Salzburger Nachrichten press quote, the `<h1>Next Concerts</h1>`, then three calendar entries (May 21 / 23 / 27, 2026) as `.calendar-entry` rounded dark cards with date, programme, location, and Details & Tickets link.
6. Full-width image: `images/2025/10_vor_der_wand.jpg`.
7. "Audio & Video" section: 4 media cards in a Bootstrap row (2-up at lg), each a clickable still with title and description. Two have expandable details via a chevron-down button.
8. Photo strip: 17 photos in a horizontal scroll-snap strip with left/right chevron buttons. **The JS that drives the strip is commented out in-page**, so the buttons currently do nothing and the strip just shows the first image at 30vh height. Caption: "© Photos Shervin Lainez".
9. Footer (shared): "Contact" heading, YCA management (Christina Baker, Mic Herring), kiron@kironatomtellian.com, Imprint link, YouTube icon.

**Static-feeling issues — specific:**
- Hero photo: empty `src`, no entry animation, no parallax, no caption reveal.
- Title "Kiron Atom Tellian": appears instantly, no fade or stagger; weight/spacing read as a print headline, not a curtain rising.
- Press quotes in bio teaser: static `<h2>` blocks, no kinetic typography, no transition between them, attribution treated as same-weight as quote body.
- "Next Concerts" cards: identical dark pills, no days-until counter, no map reference, no programme marquee, no hover state.
- Media cards: no hover-to-preview; just a still image with a play link.
- Photo strip: **broken** (JS commented out). The arrow buttons sit there inert.
- Mid-page full-bleed images: appear instantly with the page; no scroll reveal.
- No page-transition animation when navigating to a sub-page.

### Biography (`about.en.php`)
**Structure:** Hero photo `images/2025/12@0.5x.jpg` with absolutely positioned title "Biography" bottom-right at 8vw. Body is a single-column reading well (`col-10 col-md-8 col-xl-6`) with **interleaved press quotes**: 4 quotes (NDR Kultur, la Repubblica, The Tennessean, Badische Neueste Nachrichten) alternating with five bio paragraphs. Closes with a "Press…" CTA button and the shared footer.

**Static-feeling issues:**
- Quotes treated identically to the home page — `<h2>` for the quote text with inline 24pt — no editorial pull-quote feel.
- Bio paragraphs are wall-of-text; no drop cap, no inter-paragraph rhythm beyond a `<p>&nbsp;</p>` spacer.
- Hero photo: no animation, no caption, no parallax. The "Biography" title is over the photo but visually flat.
- `<main style="height: 100vh">` — this is a layout bug; it forces main to viewport height even though the content is taller. The browser still scrolls but the height constraint serves nothing.

### Press (`press.en.php`)
**Structure:** Same hero pattern with `images/2025/2@0.5x.jpg`. Body is a long single column of press excerpts: each has body paragraphs, then a centered 18pt publication name (often hyperlinked) on its own line, then italic month/year. Ten quotes, oldest 2016. Closes with a Biography CTA and the shared footer.

**Interactive elements present:**
- **Inline `<script>` in `<head>`**: on scroll, every `.press` element below 20px from the viewport bottom gets a `.visible` class. This is the *only* scroll-reveal mechanism anywhere on the site. It's bound to the container, not to individual quotes, so the whole press list fades in once when it crosses the threshold.

**Static-feeling issues:**
- The reveal is all-or-nothing. Individual press quotes don't stagger or animate independently.
- No typographic differentiation between quote and attribution beyond inline pt sizing.
- Quotes are framed with `»…«` (German guillemets) — that's a strong typographic mark that could be exploited (oversized, decorative, set against the column) but it sits as plain text in flow.

### Media (`media.en.php`)
**Structure:** Hero photo with overlay title "Media" (font-family Sumana, 6.5vw / 11vw). Body is `<h1>Audio & Video</h1>` followed by 17 media cards in a Bootstrap row. Each card: a `<figure>` with an image, a "play" anchor pointing to YouTube / Instagram / external article / ORF, then a `<h2 class="media-title">`, a description, and optionally an expandable details block (programme list, prize list) toggled by a chevron-down button. `data-id` on each figure carries the embed URL; `data-embed="true|false"` toggles whether the bundle script auto-embeds vs. opens in a new tab.

**Static-feeling issues:**
- No hover-to-preview on the thumbnails (the brief asks for muted video on hover where the source is a YouTube embed).
- Cards appear all at once on page load. No scroll reveal.
- The expandable details work but the chevron's `color: #908493` is the only signal it's interactive — no aria-expanded state, no animation on expand.
- Thumbnails are unoptimized JPEGs / PNGs / WebPs from `/cms/uploads/images/`. No `srcset`. No `loading="lazy"`.

### Schedule (`schedule.en.php`) + Schedule Archive (`schedule-archive.en.php`)
**Structure:** Identical to home's "Next Concerts" block but full-page. Hero photo at top, then a vertical stack of dark `.calendar-entry` cards: date, programme, location, "Details & Tickets" link. The archive page has the same markup but reverse-chronological past concerts going back years (6,773 lines — many entries).

**Static-feeling issues:**
- Every entry is the same dark rounded pill. No emphasis for the *next* one. No grouping by month or year.
- The archive in particular is a long unbroken list with no quick-jump, no year sidebar, no search.
- No map visualization. No filter. No keyboard navigation.

### Gallery (`gallery.en.php`) and Photos
The HTML files `gallery.html` and `photos.html` in the snapshot are byte-identical — the nav has both labels but both resolve to the same page. This is a known duplication.

**Structure:** Hero-less. Title `<h1>Image Gallery</h1>` (Sumana) at top of a dark page, then a Bootstrap row of 17 image cards (`col-sm-6 col-lg-4`) — each a clickable photo via a custom `.kat-lightbox` anchor. The `data-src` attribute carries a raw HTML string that the lightbox renders inside the modal: the high-res image plus a "High Res" download link in the corner.

**Static-feeling issues:**
- The masonry container is named `#masonry-row` but the layout is a uniform Bootstrap grid, not masonry — images at different aspect ratios sit in a rigid grid that crops their visual rhythm.
- No lazy-load (every image fetches up-front), no blur-up placeholder, no `srcset`.
- No keyboard navigation, no arrow-key paging in the lightbox (the bundle may handle this — can't verify without the JS), no focus trap audit.
- No captions: each photo has empty `alt=""`, which is also an a11y problem.
- The download link inside the lightbox is HTML embedded inside a `data-src` *string* attribute — fragile and unparseable for assistive tech.

### Contact
No separate `contact.en.php` snapshot was provided. Per the user, the contact information lives in the **shared footer** (YCA reps, email, Imprint link, YouTube). The `contact.en.php` URL referenced from the footer is presumably a legal Imprint page. Left out of scope unless the user wants it touched.

---

## Cross-cutting interactive elements (the entire current "motion budget")

There are really only **four** interactive things on the public site:

1. **Bootstrap navbar collapse** on mobile (hamburger toggle).
2. **`.kat-lightbox`** custom modal — opens a photo in an overlay; behavior provided by `kat.bundle.js` (we don't have the source).
3. **Press-page scroll-reveal** — inline `<script>` adds `.visible` to `.press` when it crosses 20px below viewport top.
4. **Media chevron-down expand** — toggles the per-card details block.

Things that *look* interactive but aren't:
- **Photo strip on the home page** — the navigation arrow buttons are rendered but the JS that animates the strip is commented out in the markup (lines ~618–762 of `index.html`). The strip is dead.
- **"Photos" vs "Gallery" nav items** — duplicate links to the same page.

That's the entire motion vocabulary of the current site. It's a print poster.

---

## Image pipeline (or lack thereof)

- All images served as single full-resolution JPEG / PNG / WebP / JPEG-with-`@0.5x.jpg` suffix.
- No `srcset` / `sizes`, no `<picture>` element, no AVIF.
- No `loading="lazy"` on below-the-fold images.
- No intrinsic `width`/`height` on any `<img>` → CLS risk.
- `alt=""` on essentially every photo. The only descriptive alt I saw was `aria-label="Play video"` on media-card anchors.
- Gallery photos live under `/cms/uploads/gallery/` with UUID-style filenames; the "High Res" version is a separate file referenced inside the lightbox.

---

## Accessibility audit (rough)

- **Keyboard**: navbar collapse is Bootstrap-native (OK). Lightbox keyboard support unknown (depends on `kat.bundle.js`). Media chevron is a `<button>` — good. No skip-link.
- **Focus**: no custom focus ring styles; relies on Bootstrap defaults, which are low-contrast in the dark sections.
- **Alt text**: missing across the board.
- **Headings**: the use of `<h2>` as a pure sizing tool for press-quote *body* (with attribution as a sibling `<p>`) breaks semantic structure. The bio page has multiple `<h2>` quotes interleaved with `<p>` paragraphs.
- **Viewport meta**: `width=device-width, initial-scale=1, maximum-scale=1, maximum-scale=1.0` — duplicate `maximum-scale` attribute, and `maximum-scale=1` actively prevents pinch-zoom. **WCAG 1.4.4 violation.**
- **Color contrast**: white-on-`bg-dark` (#fff on #212529) passes AA at body sizes. Petrol blue `#2f4858` borders are decorative. Footer link styles need a check.
- **Language**: most pages declare no `lang`; only `gallery.html`, `media.html`, `photos.html`, `schedule-archive.html` declare `lang="en"`. The home snapshot declares `lang="de"` (which is wrong for the EN page — likely a server-side bug where the layout template defaults to DE).

---

## Performance issues

- `kat.bundle.js` loaded **synchronously in `<head>`** — render-blocking on every page.
- Typekit stylesheet loaded synchronously in `<head>` — render-blocking, not preloaded.
- Bootstrap's CSS isn't visible in the snapshot HTML (no `<link>` to it) — must be inside the Typekit-loaded CSS or the JS bundle. Either way, no critical-CSS extraction.
- Multiple `meta http-equiv="expires"` / `cache-control` declarations — three of each, contradictory (one says `Tue, 01 Jan 1980` past-expiry, one says `0`, one says `no-cache`). This forces aggressive no-cache behavior on the *HTML* but not on assets. Photos still cache normally.
- Photo strip on home includes 17 full-resolution images even though the JS that needs them is commented out.
- No image lazy-loading anywhere.

---

## Quality-of-implementation issues worth a redesign-pass anyway

- Inline `style="..."` on virtually every element. The CSS strategy seems to be "Bootstrap utility + inline override."
- `id="_DSC5163"` and `id="_Brooklyn_2"` are camera/photo IDs left in the markup as element IDs. Used for nothing.
- The home page's hero `<img id="_DSC5163" src="" alt="" />` ships with empty `src`. The visible photo is in a commented-out block above it. So either (a) the bundle JS swaps in the `src` at runtime, or (b) the hero is silently broken. Either way it's not a deliberate state.
- `lang="de"` on `index.html` for the *English* home page.
- Duplicate `maximum-scale` in viewport meta.
- Nav has `Photos` AND `Gallery` pointing to the same URL.
- Stray `<span>` closing the Logout `<li>` in the CMS nav (orphan close tag).
- `pt-3text-center` (missing space) on a home-page container.
- `prev` / `next` Photo-strip JavaScript is fully commented out but the buttons that depend on it are still in the markup. Either remove or wire up.

---

## What to preserve (the parts that *are* working)

- The **editorial cadence** — alternating quote → bio paragraph → quote → bio paragraph on Biography and Press is genuinely strong.
- The **press-quote-driven identity**. Pull-quotes from named publications with dates is the right thing to lead with for a young pianist.
- The **photo selection** — Shervin Lainez's portraits are excellent and the site already gives them full-bleed space. Don't crop, don't compress, don't reframe.
- The **calendar-card primitive** — date / programme / venue / tickets is the right information density. It just needs visual differentiation between *next* and *later*.
- The **CMS**. It is a working custom CMS the user authors content in. The visual rework must not interfere with `/cms/`, the asset paths under `/cms/uploads/`, or the data contract those pages produce.
- **Bootstrap 5** as the underlying grid — keep it. We'll author on top of it rather than replacing it, so the existing markup mostly survives.

---

## Open questions for the user before Phase 2

1. **Typekit kit `ysr5edr`** — can you tell me which fonts are in it (or share the CSS at `https://use.typekit.net/ysr5edr.css`)? I want to confirm whether the body face is Adobe Caslon Pro before recommending whether to keep, refine, or replace the Sumana/Caslon pairing.
2. **`kat.bundle.js` source** — is there a non-minified source I can read, or should I treat it as a black box and rebuild the few behaviors (lightbox, media-card expand, navbar) from scratch? The latter is safer and gives us proper a11y.
3. **CMS scope** — confirmed out-of-scope for the visual rework? (My read: yes; you author content there, the public site reads what it produces, we don't touch it.)
4. **Photo strip on home** — keep it (with the JS actually wired up), or replace with something else (e.g. a quiet auto-advance carousel, a marquee, or just a static curated trio that links to the gallery)?
5. **"Photos" and "Gallery" duplicate nav items** — drop one?
6. **Imprint / `contact.en.php`** — touch it for visual consistency, or leave alone since you said "contact is at the bottom currently"?
