# ahmed310.github.io

Personal site + technical blog. Built with [Astro](https://astro.build), deployed to GitHub Pages.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## First-time deploy (one time)

This is a **project site** served under a subpath. The repo name must match `base` in
`astro.config.mjs` (currently `/dev/`). If you use a different repo name, change `base`.

1. Create a new **public** GitHub repo named exactly `dev` (empty, no README).
2. In this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/Ahmed310/dev.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) builds and publishes on every push to `main`.

Site goes live at **https://ahmed310.github.io/dev/**.

## Structure

- `src/pages/` — routes (`index`, `about`, `projects`, `blog/`)
- `src/layouts/Base.astro` — shared page shell (nav + footer + fonts)
- `src/components/` — `Nav`, `Footer`
- `src/styles/global.css` — the dark theme

## Analytics (Firebase / GA4)

The site uses Firebase Analytics (GA4 property `G-XSDZ61RPH8`, Firebase project `ahmed-dev-eb991`).
Initialization lives in `src/lib/analytics.ts`; a delegated listener in `src/layouts/Base.astro`
tracks any element carrying a `data-track` attribute, plus `<video>` engagement.

Events only fire on the deployed site (`ahmed310.github.io`) — dev, preview, and locally served
builds are silent by design. **If the site moves to a custom domain, update the hostname check in
`src/lib/analytics.ts`.**

### Custom events

| Event                | Where                                     | Params                         |
| -------------------- | ----------------------------------------- | ------------------------------ |
| `detail_open`        | project/game card → case-study modal      | `project`                      |
| `project_link_click` | links inside modals (docs, repo, store…)  | `label`, `project`, `link_url` |
| `video_play`         | modal `<video>` user-initiated play       | `label` (file), `project`      |
| `video_complete`     | non-looping `<video>` played to end       | `label`, `project`             |
| `social_click`       | footer github/linkedin/blog               | `label`, `link_url`            |
| `contact_click`      | footer email (mailto)                     | `label`, `link_url`            |

Notes:
- Ambient card-preview videos (muted, no controls, autoplay on scroll) are deliberately NOT
  counted as `video_play`; neither is the modal's automatic hero autoplay. Only user-initiated
  plays of controlled videos count.
- Looping modal videos never fire `video_complete` (browsers don't emit `ended` on loop) —
  judge video interest by `video_play`.
- YouTube embeds carry `?enablejsapi=1`, so GA4 enhanced measurement can report
  `video_start`/`video_progress`/`video_complete` for them (best-effort — the modal clones
  iframes dynamically).
- GA4 enhanced measurement adds `page_view`, `scroll` (90%), and outbound `click` automatically.
  Never sum the automatic `click` with `social_click`/`project_link_click` — they intentionally
  overlap; the custom events carry better params.

### One-time GA4 console setup (required, do this BEFORE the site gets traffic)

Custom event params are **invisible in all GA4 reports** until registered, and registration is
**not retroactive** — data collected before registration is lost to reporting.

1. GA4 Admin → **Custom definitions** → create two **event-scoped** custom dimensions:
   - dimension name `label`, event parameter `label`
   - dimension name `project`, event parameter `project`
2. (Optional) Admin → Events → toggle `contact_click` as a **key event** to treat email clicks
   as conversions.

### Verifying events

Install the "Google Analytics Debugger" Chrome extension, open the live site, and watch events
arrive in GA4 → Admin → **DebugView**. Expect real-world undercounting from ad blockers.

## Adding a blog post

(Blog content collection + article template are added in the next step.)
