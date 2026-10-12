# Deploy

Vercel Hobby (free). Ken approves every public deploy.

## What ships

The live site is static. Under `.vercelignore`, only these public files should reach visitors:

- `index.html`
- `styles.css`
- `site.js`
- `sample-id-sheet.svg`

`vercel.json` stays in the project (`cleanUrls: true`). Docs, content, personas, prompts, scripts, `START_HERE.md`, `.cursor`, `node_modules`, package files, and screenshots do not ship.

## Where it deploys

- Plan: Vercel Hobby (free).
- Production: `main` only.
- Preview deployments: off. Do not turn them on unless Ken asks.
- Hostname: a free `*.vercel.app` name that Ken picks. Do not invent or reserve one for him.
- Custom domain: off unless Ken approves the cost.

## Cadence

Batch merges. About 1 to 2 production deploys a day. Do not merge a stream of tiny PRs that each hit production.

Ken approves the merge. Keny squash-merges to `main` only after that approval. Then Keny checks the live `*.vercel.app` URL and tells Ken.

## Do not

- Deploy from a feature branch.
- Deploy without Ken’s approval.
- Force-push, skip hooks, or change git config.
- Auto-merge.
- Add a paid domain, analytics plan, or other paid Vercel add-on without Ken.
