# CMS restyle — drop-in files

This folder restyles the existing PHP + TinyMCE CMS at `/cms/` to match
the new public design system. It does not rewrite any of your CMS logic —
it's two CSS files, one JS file, and one new PHP endpoint.

## Files

| File                                 | What it does                                            |
| ------------------------------------ | -------------------------------------------------------- |
| `assets/css/cms.css`                 | Drop-in stylesheet that re-skins the entire admin UI.   |
| `assets/js/publish-button.js`        | Wires up the "Publish to website" button.               |
| `publish.php`                        | Server endpoint that rebuilds the public site and atomically swaps it into the web root. |

## Install on the server

1. **Copy** `apps/cms/assets/` into `/path/to/cms/assets/` on the server
   (or wherever your existing `/cms/` lives).
2. **Copy** `publish.php` into your CMS directory (alongside `index.php`).
3. **In every CMS PHP page**, add to the `<head>` *after* Bootstrap:
   ```html
   <link rel="stylesheet" href="/cms/assets/css/cms.css">
   ```
4. **In the CMS shared header partial**, add the publish button (good
   place: inside the navbar's right-side `<ul class="navbar-nav ms-auto">`):
   ```html
   <li class="nav-item">
     <button type="button" class="kat-publish" data-publish>
       Publish to website
     </button>
   </li>
   ```
   And in the body, near the end:
   ```html
   <div class="kat-publish-toast" data-publish-toast></div>
   <script src="/cms/assets/js/publish-button.js" defer></script>
   ```

## Configure `publish.php`

Edit the constants at the top:

- `$repoRoot` — where the git checkout of this repository lives on the server
- `$publicWebRoot` — where the live site is served from (Nginx/Apache root)
- `$npmBin`, `$gitBin` — full paths if `npm` / `git` aren't on the web user's PATH

The endpoint:

1. (Optionally) `git pull --ff-only` in the repo.
2. `npm ci` then `npm run build` inside `apps/public/`.
3. Atomically swaps the generated `dist/` into `publicWebRoot`, moving
   the previous root to `publicWebRoot.prev` for instant rollback.
4. Returns JSON `{ ok: true }` on success.

**Auth:** `publish.php` is intentionally **not** auth-protected by itself.
Wire it into your existing CMS session check before going live, e.g.:

```php
session_start();
if (empty($_SESSION['user'])) fail('Not authenticated', 401);
```

## Optional CMS schema additions

The new public site uses these enriched concert fields. Add them to your
CMS's concert form so you can keep them current:

- `type` — one of `orchestra`, `recital`, `chamber`
- `orchestra` — name (only used when `type=orchestra`)
- `conductor` — name (only used when `type=orchestra`)
- `chamberPartners` — list of `{ name, instrument }` (only when `type=chamber`)
- `notes` — optional free text

And on gallery photos:

- `alt` — required descriptive alt text (a11y)
