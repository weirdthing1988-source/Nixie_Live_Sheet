# Nixie Live Character Sheet — Basic Version

A dependency-free, four-tab browser character sheet for **Nixella “Nixie” Null**, a standard D&D Level 5 Changeling Bard.

## Included

1. **Base Stats**
   - Name, avatar, HP, AC, movement, initiative, spell values and Bardic Inspiration.
   - **Go Live** switch between Mage and Idol forms.
   - Front-page Banhammer attack and damage rollers.
   - Quick spell roller and spell-slot consumption.

2. **Attributes & Skills**
   - Six ability scores, saving throws and all listed skill modifiers.
   - Normal, advantage and disadvantage modes.

3. **Spells**
   - Base spells imported from the supplied character PDF.
   - Empty editable Performance-spell collection, available only in Idol form.
   - 1st-, 2nd- and 3rd-level spell-slot trackers.

4. **Inventory**
   - Items imported from the supplied character PDF.
   - Editable Banhammer configuration for Mage and Idol forms.
   - Separate Mage and Idol avatar uploads.

## Banhammer defaults

The exact Idol-form numbers were not specified, so the prototype uses editable draft values:

- **Mage:** +4 attack, 1d4+1 bludgeoning — a normal club.
- **Idol:** +4 attack, 1d6+1 bludgeoning plus 1d6 radiant.

Change these in **Inventory → Banhammer Configuration**. The front-page card and rollers update immediately.

## Saving

- Changes save automatically in the browser using `localStorage`.
- **Export** creates a JSON backup.
- **Import** restores a JSON backup.
- Uploaded avatar images are stored in the same local save and export, so very large images can make the save file large.

## Run locally

Open `index.html` directly, or serve the directory with any static server.

Example with Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Cloudflare Pages / GitHub

This folder is static and can be deployed directly to GitHub Pages or Cloudflare Pages. No build command is required. Use the project root as the output directory.
