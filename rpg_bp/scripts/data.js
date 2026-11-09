import { CONFIG } from "./config.js";

const store = new Map();

function defaultData() {
  return {
    level: 1,
    exp: 0,
    expToNext: CONFIG.leveling.baseExp,
    attrPoints: 0,
    skillPoints: 0,
    classId: null,
    attributes: { str: 5, agi: 5, vit: 5, int: 5, dex: 5, luk: 5 },
    skills: [],
    artifacts: Object.fromEntries(CONFIG.artifactSlots.map((s) => [s, null])),
    ownedArtifacts: [],
    mana: 100,
    stamina: 100
  };
}

export function getData(player) {
  const id = player.id;
  if (!store.has(id)) store.set(id, defaultData());
  return store.get(id);
}

export function saveData(player) {
  try {
    player.setDynamicProperty("rpg:data", JSON.stringify(getData(player)));
  } catch (_) {}
}

export function loadData(player) {
  try {
    const raw = player.getDynamicProperty("rpg:data");
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw);
      const base = defaultData();
      store.set(player.id, {
        ...base,
        ...parsed,
        attributes: { ...base.attributes, ...(parsed.attributes || {}) },
        artifacts: { ...base.artifacts, ...(parsed.artifacts || {}) }
      });
    }
  } catch (_) {}
}

export function clearData(id) {
  store.delete(id);
}

export function getTotalAttributes(data) {
  const total = { ...data.attributes };
  const pct = { hpPct: 0, manaPct: 0, meleePct: 0, critPct: 0, defPct: 0, expPct: 0 };

  const apply = (b) => {
    if (!b) return;
    for (const [k, v] of Object.entries(b)) {
      if (k in total) total[k] += v;
      else if (k in pct) pct[k] += v;
    }
  };

  for (const id of data.skills) apply(CONFIG.skills[id]?.bonuses);
  for (const slot of CONFIG.artifactSlots) {
    const aid = data.artifacts[slot];
    if (aid) apply(CONFIG.artifacts[aid]?.bonuses);
  }
  return { attrs: total, pct };
}

export function getDerived(data) {
  const { attrs, pct } = getTotalAttributes(data);
  const f = CONFIG.formulas;
  const lvl = data.level;

  return {
    attrs,
    pct,
    maxHp: Math.floor(f.maxHp(attrs, lvl) * (1 + pct.hpPct)),
    maxMana: Math.floor(f.maxMana(attrs, lvl) * (1 + pct.manaPct)),
    maxStamina: f.maxStamina(attrs, lvl),
    meleeBonus: f.meleeBonus(attrs) * (1 + pct.meleePct),
    rangedBonus: f.rangedBonus(attrs),
    magicBonus: f.magicBonus(attrs),
    critChance: Math.min(75, f.critChance(attrs) + pct.critPct * 100),
    critDamage: f.critDamage(attrs),
    defense: f.defense(attrs) * (1 + pct.defPct),
    expBonus: pct.expPct
  };
}
