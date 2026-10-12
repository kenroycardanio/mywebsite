# Start here

This repo is the shared voice and source of truth for Ken Roy Cardanio’s personal showcase site. Every agent reads this file first, then the constitution and the evidence file, then builds from what is already here.

The public site is a concise employer profile. It is not a product catalog, a freelance menu, or the Covered & Calm insurance practice. Life planning stays in its own lane. The only Covered & Calm presence on this site is the existing AIA profile link already on the page.

Static HTML, CSS, and JS. Deploy later on Vercel Hobby. Do not deploy, merge, or change the live design or copy unless Ken approves that work.

## Core values (summary)

Constitution: `docs/CORE_VALUES.md`. If a public line conflicts with it, the constitution wins.

**Tagline:** *One useful task. Proof you can see. Pay for the finished job.*

- Services first. One finished task a school or small shop can already pay for.
- A staff role stays open when the work is the same kind.
- Life planning stays separate: AIA Philippines agent practice since 2019 (OL & VUL). Not software, not the print shop, not corporate AIA. No rates, benefits, returns, or guarantees.
- Start from the sheet, form, Photoshop file, or log the client already uses.
- Finish the scoped job. No full-company-platform promise.
- Show only work that exists. No invented clients, testimonials, titles, years, or results.
- Do not publish a price until Ken sets it. Student print work stays affordable, with no peso amount on the page.
- Do not name the financing partner. A partner finances Prints & Beyond. Ken is GM and the only employee.

Evidence file: `docs/SHOWCASE_LIBRARY.md`. Page wording as it stands: `content/PAGE_COPY.md`. How agents work: `docs/COLLABORATION.md`.

## Folder map

| Area | Path | What it holds |
|---|---|---|
| Live site | `index.html`, `styles.css`, `site.js`, `ken-photo.png`, `sample-id-sheet.svg` | The only files Vercel should serve. Do not change them in a repo-structure pass. |
| Docs | `docs/` | Constitution, collaboration protocol, showcase evidence, brand voice, deploy notes. |
| Content | `content/` | Current page copy. Not the strategy file. |
| Team | `personas/`, `prompts/`, `.cursor/rules/` | Who owns the site, boot prompts, and always-on rules. |
| Scripts | `scripts/` | Local check and screenshot tools. Not deployed. |

Also at the root: `START_HERE.md`, `package.json` (dev scripts only), `vercel.json`, `.vercelignore`, `.gitignore`.

## Preview locally

From the repo root, serve the live files. Do not open a build step; there is none.

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`. The page is `index.html` with `styles.css` and `site.js`. `ken-photo.png` is the hero portrait. `sample-id-sheet.svg` is a live asset; it is not linked from the current page. Add `?shot=1` to freeze motion for screenshots.

You can also open `index.html` directly in a browser. A local server is better for fonts and for the screenshot script.

## QA: check and screenshots

Install dev dependencies once (`npm install`). They do not ship with the site.

```bash
npm run check
npm run screenshot
```

`npm run check` is dependency-light. It confirms that `index.html` points at files that exist, that internal `#` anchors resolve, that the live files do not mention the old root docs (`CORE_VALUES.md`, `COLLABORATION.md`, `SHOWCASE_LIBRARY.md`, `PAGE_COPY.md`), and that no AIA logo image is referenced.

`npm run screenshot` writes first-screen and full-page shots of `index.html?shot=1` into `screenshots/` (gitignored):

- `screenshots/phone-390x844.png`
- `screenshots/phone-390x844-full.png`
- `screenshots/desktop-1280x800.png`
- `screenshots/desktop-1280x800-full.png`

Keny reviews those shots. Ken approves the merge. The public page must look unchanged unless Ken approved a visual change.

## Deploy

Vercel Hobby, from `main` only, after Ken approves. Full notes: `docs/ops/DEPLOY.md`.
