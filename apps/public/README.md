# kironatomtellian-public

Astro 4 static build of the public site for kironatomtellian.com.

## Run locally

```bash
cd apps/public
npm install
npm run dev
```

Open <http://localhost:4321>.

## Build for production

```bash
npm run build
```

Output goes to `dist/`. The directory is fully static — upload it to the web root.

## Photos

Photos live in `public/img/` and are referenced by `src/data/home.json` and
`src/data/gallery.json`. Drop replacements in with the same filenames to swap
them out.

## Fonts

The site references the Adobe Fonts kit `ysr5edr` and falls back to
Newsreader / Sorts Mill Goudy / Cormorant Garamond / Georgia. Once Adobe
Caslon Pro is added to the kit at <https://fonts.adobe.com/>, it will load
automatically — nothing in the code changes.
