# Bedrock RPG System

Fantasy Action Real-time RPG add-on for **Minecraft Bedrock Edition 1.21+**.

[![Minecraft](https://img.shields.io/badge/Minecraft-Bedrock%201.21+-green)]()
[![Script API](https://img.shields.io/badge/Script%20API-required-orange)]()

## Features

| System | Description |
|--------|-------------|
| **Classes** | Warrior, Rogue, Archer, Mage, Cleric, Paladin — chosen once on first join |
| **Attributes** | STR · AGI · VIT · INT · DEX · LUK with point allocation on level-up |
| **Leveling** | EXP from killing mobs (scaled by mob type), attribute & skill points |
| **Skill Tree** | General tree + class-specific tree, prerequisites and level gates |
| **Artifacts** | 6 slots (Amulet, Ring×2, Relic, Cape, Main) — own / equip / unequip |
| **Combat** | Melee / ranged / magic bias, crit chance & damage, defense reduction |
| **Persistence** | Player data saved with Dynamic Properties |

## Requirements

- Minecraft Bedrock **1.21+**
- World experiment: **Beta APIs** (required for Script API)
- Both Behavior Pack and Resource Pack enabled

## Installation

### Option A — `.mcaddon`
1. Download `RPG_System.mcaddon` from Releases (or build from source)
2. Open the file (imports into Minecraft)
3. Edit world → **Experiments** → enable **Beta APIs**
4. Activate **RPG System** behavior pack and resource pack

### Option B — From source
Copy `rpg_bp` into `behavior_packs` and `rpg_rp` into `resource_packs`, then enable in the world.

## Commands

| Command | Action |
|---------|--------|
| `!rpg` | Open main menu |
| `!menu` | Same as `!rpg` |

## Project structure

```
rpg_bp/                 Behavior Pack
  manifest.json
  scripts/
    main.js             Entry point, events
    config.js           All tunable values & content data
    data.js             Player state load/save + derived stats
    progression.js      EXP, level-up, skills, artifacts
    combat.js           Damage & crit modifiers
    ui.js               Forms / menus
  texts/en_US.lang
rpg_rp/                 Resource Pack
  manifest.json
  texts/en_US.lang
```

## Script modules

- `@minecraft/server` `1.14.0`
- `@minecraft/server-ui` `1.2.0`

## Configuration

Edit `rpg_bp/scripts/config.js` to change:

- Level curve and points per level
- Class base attributes
- Skill nodes (cost, requirements, bonuses)
- Artifact definitions
- EXP table per mob type
- Combat formulas

## Development notes

- Content (skill names, artifact names, numbers) is centralized in `config.js`.
- Data key: `rpg:data` (Dynamic Property).
- Not fully verified on every Bedrock minor build — test after import.
- UUID of BP: `7bb17f89-7d24-46fd-8e0c-51569411c45b`
- UUID of RP: `39153102-c8a1-4547-8b3b-8c7c796d62b5`

## License

Feel free to use and modify for personal or server use. Credit appreciated.

## Credits

Designed as a Fantasy Action RPG framework for Bedrock Script API.
