# kironatomtellian-public

Astro 4 static build of the public site for kironatomtellian.com.

## Run locally

```bash
cd apps/public
npm install
node tools/generate-placeholders.mjs    # only on first run, generates placeholder photos
npm run dev
```

Open <http://localhost:4321>.

## Build for production

```bash
npm run build
```

Output goes to `dist/`. The directory is fully static — upload it to the web root.

## Replacing placeholders with real photos

When the real photos arrive, drop them into `public/img/` with the exact
filenames listed in `src/data/home.json`. The placeholder generator script
will not overwrite existing files (pass `--force` to overwrite).

For the eventual CMS integration the same image references will resolve to
`/cms/uploads/{gallery,images}/...` on the production server; the build's
`base` configuration and the JSON data file are the only things that change.

## Fonts

The site references the Adobe Fonts kit `ysr5edr` and falls back to
Newsreader / Sorts Mill Goudy / Cormorant Garamond / Georgia. Once Adobe
Caslon Pro is added to the kit at <https://fonts.adobe.com/>, it will load
automatically — nothing in the code changes.
