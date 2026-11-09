export const CONFIG = {
  debug: false,
  namespace: "rpg",

  leveling: {
    baseExp: 80,
    growth: 1.32,
    attrPointsPerLevel: 5,
    skillPointsPerLevel: 2,
    maxLevel: 100
  },

  classes: ["Warrior", "Rogue", "Archer", "Mage", "Cleric", "Paladin"],

  classBases: {
    Warrior: { str: 8, agi: 4, vit: 8, int: 3, dex: 4, luk: 3 },
    Rogue:   { str: 4, agi: 9, vit: 4, int: 3, dex: 8, luk: 5 },
    Archer:  { str: 3, agi: 7, vit: 4, int: 3, dex: 9, luk: 5 },
    Mage:    { str: 2, agi: 4, vit: 3, int: 10, dex: 4, luk: 4 },
    Cleric:  { str: 3, agi: 4, vit: 6, int: 8, dex: 3, luk: 4 },
    Paladin: { str: 7, agi: 3, vit: 7, int: 5, dex: 3, luk: 3 }
  },

  formulas: {
    maxHp: (a, lvl) => 20 + a.vit * 5 + lvl * 3,
    maxMana: (a, lvl) => 40 + a.int * 8 + lvl * 2,
    maxStamina: (a, lvl) => 80 + a.agi * 3 + a.vit * 2,
    meleeBonus: (a) => a.str * 0.35,
    rangedBonus: (a) => a.dex * 0.30,
    magicBonus: (a) => a.int * 0.40,
    critChance: (a) => 5 + a.dex * 0.35 + a.luk * 0.25,
    critDamage: (a) => 1.5 + a.str * 0.01 + a.luk * 0.008,
    defense: (a) => a.vit * 0.4
  },

  expTable: {
    default: 12,
    zombie: 18, skeleton: 18, creeper: 22, spider: 15,
    enderman: 45, witch: 35, blaze: 30, wither_skeleton: 40,
    piglin: 20, hoglin: 28, ravager: 80, warden: 200,
    wither: 350, ender_dragon: 500
  },

  artifactSlots: ["amulet", "ring1", "ring2", "relic", "cape", "main"],

  skills: {
    g_hp1:   { name: "Vitality I",   cost: 1, reqLevel: 1,  requires: [], bonuses: { vit: 2 } },
    g_hp2:   { name: "Vitality II",  cost: 2, reqLevel: 10, requires: ["g_hp1"], bonuses: { vit: 3, hpPct: 0.05 } },
    g_exp1:  { name: "Scholar I",    cost: 1, reqLevel: 1,  requires: [], bonuses: { expPct: 0.08 } },
    g_exp2:  { name: "Scholar II",   cost: 2, reqLevel: 15, requires: ["g_exp1"], bonuses: { expPct: 0.12 } },
    g_luck1: { name: "Fortune I",    cost: 1, reqLevel: 5,  requires: [], bonuses: { luk: 3 } },
    g_move1: { name: "Swiftness I",  cost: 1, reqLevel: 3,  requires: [], bonuses: { agi: 2 } },

    w_str1:  { name: "Power I",      cost: 1, reqLevel: 1,  requires: [], class: "Warrior", bonuses: { str: 3 } },
    w_str2:  { name: "Power II",     cost: 2, reqLevel: 8,  requires: ["w_str1"], class: "Warrior", bonuses: { str: 4, meleePct: 0.08 } },
    w_tank1: { name: "Iron Skin",    cost: 1, reqLevel: 5,  requires: [], class: "Warrior", bonuses: { vit: 3, defPct: 0.06 } },
    w_tank2: { name: "Fortress",     cost: 3, reqLevel: 18, requires: ["w_tank1"], class: "Warrior", bonuses: { vit: 5, defPct: 0.10, hpPct: 0.08 } },
    w_rage:  { name: "Battle Rage",  cost: 2, reqLevel: 12, requires: ["w_str1"], class: "Warrior", bonuses: { str: 2, critPct: 0.05 } },

    r_agi1:  { name: "Shadowstep I", cost: 1, reqLevel: 1,  requires: [], class: "Rogue", bonuses: { agi: 3 } },
    r_crit1: { name: "Assassin I",   cost: 1, reqLevel: 4,  requires: [], class: "Rogue", bonuses: { dex: 2, critPct: 0.06 } },
    r_crit2: { name: "Assassin II",  cost: 2, reqLevel: 14, requires: ["r_crit1"], class: "Rogue", bonuses: { critPct: 0.10, luk: 2 } },
    r_dex1:  { name: "Precision",    cost: 2, reqLevel: 8,  requires: ["r_agi1"], class: "Rogue", bonuses: { dex: 4, meleePct: 0.06 } },

    a_dex1:  { name: "Eagle Eye I",  cost: 1, reqLevel: 1,  requires: [], class: "Archer", bonuses: { dex: 3 } },
    a_dex2:  { name: "Eagle Eye II", cost: 2, reqLevel: 10, requires: ["a_dex1"], class: "Archer", bonuses: { dex: 4, critPct: 0.07 } },
    a_agi1:  { name: "Quick Draw",   cost: 1, reqLevel: 5,  requires: [], class: "Archer", bonuses: { agi: 3 } },
    a_range: { name: "Longshot",     cost: 2, reqLevel: 12, requires: ["a_dex1"], class: "Archer", bonuses: { dex: 2, luk: 2 } },

    m_int1:  { name: "Arcane I",     cost: 1, reqLevel: 1,  requires: [], class: "Mage", bonuses: { int: 3 } },
    m_int2:  { name: "Arcane II",    cost: 2, reqLevel: 9,  requires: ["m_int1"], class: "Mage", bonuses: { int: 4, manaPct: 0.10 } },
    m_mana1: { name: "Mana Pool",    cost: 1, reqLevel: 4,  requires: [], class: "Mage", bonuses: { int: 2, manaPct: 0.08 } },
    m_power: { name: "Overcharge",   cost: 3, reqLevel: 16, requires: ["m_int2"], class: "Mage", bonuses: { int: 5 } },

    c_int1:  { name: "Faith I",      cost: 1, reqLevel: 1,  requires: [], class: "Cleric", bonuses: { int: 2, vit: 2 } },
    c_vit1:  { name: "Blessing",     cost: 1, reqLevel: 5,  requires: [], class: "Cleric", bonuses: { vit: 3, hpPct: 0.05 } },
    c_int2:  { name: "Faith II",     cost: 2, reqLevel: 11, requires: ["c_int1"], class: "Cleric", bonuses: { int: 4 } },
    c_guard: { name: "Holy Guard",   cost: 2, reqLevel: 15, requires: ["c_vit1"], class: "Cleric", bonuses: { defPct: 0.08, vit: 2 } },

    p_str1:  { name: "Zeal I",       cost: 1, reqLevel: 1,  requires: [], class: "Paladin", bonuses: { str: 2, vit: 2 } },
    p_tank1: { name: "Aegis",        cost: 1, reqLevel: 5,  requires: [], class: "Paladin", bonuses: { vit: 3, defPct: 0.05 } },
    p_str2:  { name: "Zeal II",      cost: 2, reqLevel: 10, requires: ["p_str1"], class: "Paladin", bonuses: { str: 3, meleePct: 0.05 } },
    p_holy:  { name: "Divine Might", cost: 3, reqLevel: 18, requires: ["p_str2", "p_tank1"], class: "Paladin", bonuses: { str: 3, vit: 3, hpPct: 0.06 } }
  },

  artifacts: {
    amulet_power: { name: "Amulet of Power",   slot: "amulet", rarity: "Rare",      bonuses: { str: 4 } },
    amulet_mind:  { name: "Amulet of Insight", slot: "amulet", rarity: "Rare",      bonuses: { int: 4 } },
    amulet_life:  { name: "Amulet of Life",    slot: "amulet", rarity: "Epic",      bonuses: { vit: 5, hpPct: 0.06 } },
    ring_crit:    { name: "Ring of Precision", slot: "ring",   rarity: "Rare",      bonuses: { dex: 3, critPct: 0.04 } },
    ring_fortune: { name: "Ring of Fortune",   slot: "ring",   rarity: "Epic",      bonuses: { luk: 5, expPct: 0.05 } },
    ring_fury:    { name: "Ring of Fury",      slot: "ring",   rarity: "Epic",      bonuses: { str: 3, critPct: 0.03 } },
    relic_guard:  { name: "Guardian Relic",    slot: "relic",  rarity: "Epic",      bonuses: { vit: 4, defPct: 0.07 } },
    relic_arcane: { name: "Arcane Relic",      slot: "relic",  rarity: "Legendary", bonuses: { int: 6, manaPct: 0.10 } },
    cape_swift:   { name: "Cape of Swiftness", slot: "cape",   rarity: "Rare",      bonuses: { agi: 4 } },
    cape_shadow:  { name: "Shadow Cloak",      slot: "cape",   rarity: "Legendary", bonuses: { agi: 5, critPct: 0.05 } },
    main_blade:   { name: "Hero's Crest",      slot: "main",   rarity: "Mythic",    bonuses: { str: 6, vit: 4, meleePct: 0.10 } },
    main_orb:     { name: "Void Orb",          slot: "main",   rarity: "Mythic",    bonuses: { int: 7, manaPct: 0.12 } },
    main_crown:   { name: "Eternal Crown",     slot: "main",   rarity: "Divine",    bonuses: { str: 3, agi: 3, vit: 3, int: 3, dex: 3, luk: 3, hpPct: 0.08 } }
  }
};
