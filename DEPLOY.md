# Deploy

The public site builds with Astro and deploys to GitHub Pages via Actions.

## First-time setup (one-time)

1. Go to **Settings → Pages** on the `kironatomtellian/website` repo.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. That's it. The next push to `main` triggers a build + deploy.

## Live URLs

- **Initial:** <https://kironatomtellian.github.io/website>
- **After custom domain:** <https://kironatomtellian.com>

## Triggering a deploy

- Push to `main`, or
- Open the **Actions** tab → **Deploy site to GitHub Pages** → **Run workflow**.

## Switching to the custom domain (kironatomtellian.com)

When you're ready to flip from `github.io/website` to `kironatomtellian.com`:

1. Create the file `apps/public/public/CNAME` with one line:

   ```
   kironatomtellian.com
   ```

2. In `apps/public/astro.config.mjs`, change:

   ```js
   site: "https://kironatomtellian.com",
   base: "/",
   ```

3. Point DNS at GitHub Pages. From your registrar's panel, set four A records on the apex (`kironatomtellian.com`):

   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

   And a CNAME on `www.kironatomtellian.com` pointing to `kironatomtellian.github.io`.

4. In **Settings → Pages**, set **Custom domain** to `kironatomtellian.com` and check **Enforce HTTPS** once the cert provisions (5–30 minutes after DNS propagates).

5. Commit, push to `main`, the next deploy picks up the new base path.

**Heads up:** step 3 takes the *current* PHP site offline. Coordinate with whoever runs the existing DNS (your dad). The TTL on the existing records determines how long stale lookups linger.

## Local preview

```bash
cd apps/public
npm install
npm run dev                            # http://localhost:4321/website/
```

For a production-equivalent preview:

```bash
npm run build
npm run preview                        # http://localhost:4321/website/
```
