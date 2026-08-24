# Interactive Terminal Portfolio

A full-screen, keyboard-driven terminal built for a pentester / red teamer. No
framework, no build step — three files: `index.html`, `style.css`, `script.js`.

## How it works

- The site boots with a short auto-typed connection sequence, then hands control
  to a real `<input>` styled as a shell prompt.
- Visitors type commands (`help`, `whoami`, `about`, `skills`, `experience`,
  `projects`, `writeups`, `certs`, `contact`, `theme`, `matrix`, `clear`) and get
  formatted output, same as a real terminal.
- Command history works with `↑` / `↓`. `Tab` does simple autocomplete.
- Tap-friendly buttons under the terminal run the same commands for mobile users
  who don't want to type.
- `theme green|amber|blue|red` switches the whole color scheme (persisted via
  `localStorage`) — a nod to real terminal customization culture.
- `matrix on|off` toggles a canvas-based digital-rain background effect. It's
  automatically skipped for visitors with "reduce motion" enabled system-wide.
- `certs` prints a slow, auto-scrolling row of certification badges (generic
  seal-style SVGs, not vendor logos) above the usual text list. The strip
  loops seamlessly and pauses on hover/focus; it's static for visitors with
  "reduce motion" enabled.

## Customize

1. **Identity & content** — open `script.js` and edit the `commands` object.
   Each command (`whoami`, `about`, `skills`, `experience`, `projects`,
   `writeups`, `certs`, `contact`) is a small function building its own output —
   edit the text/links directly.
2. **Boot sequence** — edit the `bootLines` array near the top of `script.js`.
3. **Certification badges** — real image files, in the `badges/` folder next
   to `index.html`. To use your own:
   - Drop your badge image (PNG, SVG, JPG — any web image format) into
     `badges/`, e.g. `badges/oscp.png`.
   - Open `script.js` and edit the `CERTS` array: set each entry's `image`
     field to the path of your file, plus `acronym`, `name`, `status`
     (`'done'` or `'in-progress'`), and `url` — the Credly page for that
     specific badge (open the badge on Credly and copy its URL, something
     like `https://www.credly.com/badges/<badge-id>`).
     ```js
     { acronym: 'OSCP', name: 'Offensive Security Certified Professional',
       status: 'done', image: 'badges/oscp.png',
       url: 'https://www.credly.com/badges/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
     ```
   - Clicking a badge with a `url` set opens that Credly page in a new tab.
     Leave `url: ''` for a cert you haven't earned yet (like the sample
     `RTOP` entry) — it'll stay dim and non-clickable instead of linking
     anywhere until you fill it in.
   - If an image path is missing or fails to load, that badge automatically
     falls back to a small generated placeholder seal instead of a broken
     image icon — nothing breaks if you haven't added a file yet.
   - Five placeholder badge images already ship in `badges/` so the site
     looks right out of the box; replace them with your real ones.
4. **Colors** — edit the `[data-theme="..."]` blocks at the top of `style.css`
   to adjust or add color schemes (each just sets `--fg`, `--fg-dim`, `--accent`).
5. **Window size** — the terminal window sizing is set in `.term-window` in
   `style.css` (`width`/`height`, currently up to 1240px / 840px).
6. **Window title / page title** — edit `<title>` and `.term-title` in
   `index.html`.
7. **No-JS fallback** — the `<noscript>` block in `index.html` is what search
   engines and non-JS visitors see; keep it in sync with your real info.

## Preview locally

Open `index.html` directly in a browser — no server required.

## Deploy to GitHub Pages

1. Create a repository named `<your-github-username>.github.io`.
2. Push these three files to the repository root.
3. In **Settings → Pages**, set the source to the `main` branch, root folder.
4. Live at `https://<your-github-username>.github.io/` within a few minutes.

Works the same on Netlify, Vercel, or Cloudflare Pages — static files, no build
command needed.
