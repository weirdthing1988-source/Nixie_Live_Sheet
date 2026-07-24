# Nixie Parallel-Class Character Sheet v2

A dependency-free browser character sheet for Nixella “Nixie” Null.

Nixie has one shared character level and two parallel classes:

- **Mage Form — Bard:** practical arcane spells, Bardic Inspiration and the dormant Banhammer.
- **Idol Form — Idol:** Performance Moves, Encore, V-Tube FX and the empowered Radiant Banhammer.

Go Live changes the active class. HP, attributes, proficiency, spell slots, equipment and level remain shared.

## Included tabs

1. **Base Stats** — compact Mage/Idol avatars, separate Level field, active parallel class, Go Live, HP, class features, Banhammer and quick actions.
2. **Attributes & Skills** — standard D&D ability checks, saving throws, skills, passives and proficiencies.
3. **Spells & Moves** — dynamically swaps between the Mage spellbook and Idol setlist; includes shared spell-slot tracking and level-locked V-Tube FX.
4. **Inventory** — equipment, currency and editable Banhammer values.
5. **Personality** — both full portraits, personal details, traits, ideals, bonds, flaws, backstory and campaign notes.

## Built-in rules data

### Mage spellbook

Mage Hand, Disguise Self, Magic Missile, Shield, Detect Magic and Locate Object.

### Idol Performance Moves

Spotlight, Superchat, Get Hyped!, Winky Heart, Stage Fog, Dubstep, Echoing Illusion, Crowd Surf and Radiant Laser.

### Idol features

Encore; V-Tube FX: 2D Mode at level 2; Chibi Mode at level 5; Scene Transition at level 8; Technical Difficulties at level 11.

## Cloudflare Pages with GitHub

Create or edit a **Pages** project and use:

- Framework preset: `None`
- Production branch: `main`
- Build command: leave blank, or use `exit 0`
- Build output directory: `public`
- Root directory: leave blank when these files are in the repository root
- Deploy command: leave blank

Do not use `npx wrangler deploy` for a Pages Git deployment.

## Local use

```bash
npm install
npm run dev
```

You can also serve the `public/` folder using any static web server.

The sheet saves locally in the browser and supports JSON export/import. Compact avatar uploads override the bundled square avatars; the full portraits on the Personality tab remain bundled assets.
