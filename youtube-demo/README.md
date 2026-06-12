# Nova — AI Mentor (demo site)

Public landing page for the YouTube → Patreon funnel. Shows the feature, embeds
the build video, and sends people to Patreon to get the copy-paste prompt.

**Static. No API keys. Safe to be public.**

## Set it up (5 min)

1. Create a **new, empty GitHub repo** (e.g. `nova-demo`).
2. Copy the files from this folder into it.
3. Open `index.html` and edit the three lines at the bottom:
   ```js
   const PATREON_URL = 'https://www.patreon.com/YOUR_HANDLE';
   const YOUTUBE_URL = 'https://youtu.be/YOUR_VIDEO_ID';
   const YOUTUBE_ID  = 'YOUR_VIDEO_ID';
   ```
4. `git push`.
5. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo → Deploy.
   No build step, no env vars — it's a static site.

## The funnel

```
YouTube video  →  this landing page  →  Patreon (the paid copy-paste prompt)
```

- **Free / public:** this page + the video. It shows the feature and the wow.
- **Paid (Patreon):** the actual prompt (see `PATREON-EP-*.md` in the main repo)
  that builds the feature in one paste.

## The filmable demo — `nova-demo.html`

A standalone copy of the Nova mentor page with the **real 3D avatar** but
**scripted answers** (no API, no key, no backend). Perfect for recording:

- Click a starter or type → Nova thinks (cozy loader) → answers in bullets.
- Hit **▶ Auto-play** to run a hands-free tour of 3 questions for the camera.
- The palette swatches recolor Nova live.
- Edit the `SCRIPT = { ... }` object near the top of the page to change what
  she says — numbers are illustrative.

Open `nova-demo.html` locally (or at `/nova-demo.html` once deployed) and screen-record it.

## Filming tip

For a "real" AI clip, film against your **actual deployed app** (the private
repo) so Nova calls the live API. For a clean, repeatable, key-free take, film
`nova-demo.html`. Either way, this public repo never holds a secret.
