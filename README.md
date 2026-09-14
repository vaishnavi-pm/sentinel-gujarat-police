# SENTINEL — Unified AI Video Intelligence Layer

Demo prototype for the Gujarat Police Innovation Challenge.
**All data is synthetic/demo data.** No connection to real Gujarat Police
camera infrastructure.

## Run it in VS Code

1. Open this folder in VS Code (`File > Open Folder…`).
2. Open a terminal in VS Code (`` Ctrl+` `` / `` Cmd+` ``).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Click the `http://localhost:5173` link that appears in the terminal
   (or Cmd/Ctrl-click it) to open the prototype in your browser.

The dev server has hot reload — edit `src/main.js` or `src/style.css`
and the browser updates automatically.

> Why a dev server instead of double-clicking `index.html`?
> The evidence-sealing step uses the browser's `crypto.subtle` API to
> generate a real SHA-256 hash. Browsers only allow that API on a
> "secure context" — `https://` or `http://localhost`. Opening the file
> directly (`file://…`) will make the "Verify Match" step fail silently
> in some browsers, so use `npm run dev` (or the build/preview steps
> below) rather than opening `index.html` directly.

## Build a static version to deploy or share

```bash
npm run build      # outputs to dist/
npm run preview    # serves the built dist/ folder locally to check it
```

The `dist/` folder is a fully static site — drop it on any static host
(GitHub Pages, Netlify, Vercel, an internal server, etc.).

## Project structure

```
index.html        # page shell (sidebar / topbar / content mount point)
src/style.css      # all styling (dark command-center theme)
src/main.js        # app state, screen rendering, event handling
```

The whole app is a single-page, vanilla JS state machine — no framework,
no build-time magic beyond Vite bundling. Screens are template strings
rendered into `#content`; navigation and actions are wired up with
plain `addEventListener` calls in `attachHandlers()`.

## Demo flow

Command → AI Search (voice/Gujarati query) → Federated Search →
Vehicle Match → Cross-Camera Journey → Officer Verification →
Evidence Locker (real client-side SHA-256) → Audit Trail.

Every action taken in a session writes a live, timestamped entry to
the Audit Trail — it is not scripted or pre-filled.

## Responsible AI language

The UI consistently uses "potential match," "candidate," "AI-assisted,"
and "requires officer verification" — never "confirmed," "guilty," or
"identified offender." See the disclaimer on the Match, Verify, and
System screens.
