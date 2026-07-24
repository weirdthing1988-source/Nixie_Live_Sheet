# Nixie Live Character Sheet — Cloudflare-ready basic version

A dependency-free, four-tab browser character sheet for Nixella “Nixie” Null.

## Project layout

- `public/` — the static website Cloudflare Pages publishes.
- `wrangler.toml` — tells Wrangler this is a Pages project and that `public/` is the output directory.
- `package.json` — provides Pages-compatible development and deployment commands.

## Cloudflare Pages with GitHub (recommended)

Create or edit a **Pages** project using these settings:

- Framework preset: None
- Production branch: main
- Build command: leave blank (or use `exit 0`)
- Build output directory: `public`
- Root directory: leave blank when these files are at the repository root

Do not set the deploy command to `npx wrangler deploy`; that command is for Workers.

## If the repository is connected through Workers Builds

Set:

- Build command: leave blank
- Deploy command: `npm run deploy`

This runs `wrangler pages deploy public --project-name=nixie-live-sheet`.
If your Cloudflare Pages project uses a different project name, change the project name in `package.json`.

## Run locally

```bash
npm install
npm run dev
```

Or serve `public/` with any static web server.

## Included

1. Base Stats with Go Live form switch, Bardic Inspiration, quick spell controls and front-page Banhammer rollers.
2. Attributes and Skills with standard D&D checks and saves.
3. Base and Performance spell sections with spell-slot tracking.
4. Inventory, avatar uploads and editable Mage/Idol Banhammer settings.

Changes are stored in browser local storage and can be backed up through JSON export/import.
