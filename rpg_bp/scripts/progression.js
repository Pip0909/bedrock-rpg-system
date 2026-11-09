import { CONFIG } from "./config.js";
import { getData, saveData, getDerived } from "./data.js";

export function addExp(player, amount) {
  const data = getData(player);
  if (data.level >= CONFIG.leveling.maxLevel) return;

  const derived = getDerived(data);
  const gained = Math.floor(amount * (1 + derived.expBonus));
  data.exp += gained;

  let leveled = false;
  while (data.exp >= data.expToNext && data.level < CONFIG.leveling.maxLevel) {
    data.exp -= data.expToNext;
    data.level++;
    data.attrPoints += CONFIG.leveling.attrPointsPerLevel;
    data.skillPoints += CONFIG.leveling.skillPointsPerLevel;
    data.expToNext = Math.floor(
      CONFIG.leveling.baseExp * Math.pow(CONFIG.leveling.growth, data.level - 1)
    );
    leveled = true;
  }

  saveData(player);

  if (gained > 0) {
    player.sendMessage(`§7+§a${gained} §7EXP`);
  }
  if (leveled) {
    player.sendMessage(`§6§lLEVEL UP! §eLv.${data.level}`);
    player.sendMessage(`§a+${CONFIG.leveling.attrPointsPerLevel} Attr  §b+${CONFIG.leveling.skillPointsPerLevel} Skill`);
    try {
      player.playSound("random.levelup");
    } catch (_) {}
  }
}

export function getExpForKill(entityTypeId) {
  const id = entityTypeId.replace("minecraft:", "");
  for (const [key, val] of Object.entries(CONFIG.expTable)) {
    if (key !== "default" && id.includes(key)) return val;
  }
  return CONFIG.expTable.default;
}

export function canUnlockSkill(data, skillId) {
  const sk = CONFIG.skills[skillId];
  if (!sk) return false;
  if (data.skills.includes(skillId)) return false;
  if (data.skillPoints < sk.cost) return false;
  if (data.level < sk.reqLevel) return false;
  if (sk.class && sk.class !== data.classId) return false;
  for (const req of sk.requires) {
    if (!data.skills.includes(req)) return false;
  }
  return true;
}

export function unlockSkill(player, skillId) {
  const data = getData(player);
  if (!canUnlockSkill(data, skillId)) return false;
  const sk = CONFIG.skills[skillId];
  data.skillPoints -= sk.cost;
  data.skills.push(skillId);
  saveData(player);
  player.sendMessage(`§aUnlocked: §e${sk.name}`);
  return true;
}

export function giveArtifact(player, artifactId) {
  const data = getData(player);
  if (!CONFIG.artifacts[artifactId]) return false;
  if (data.ownedArtifacts.includes(artifactId)) return false;
  data.ownedArtifacts.push(artifactId);
  saveData(player);
  player.sendMessage(`§dObtained Artifact: §e${CONFIG.artifacts[artifactId].name}`);
  return true;
}

export function equipArtifact(player, artifactId, slot) {
  const data = getData(player);
  const art = CONFIG.artifacts[artifactId];
  if (!art || !data.ownedArtifacts.includes(artifactId)) return false;

  // slot compatibility
  const want = art.slot;
  if (want === "ring") {
    if (slot !== "ring1" && slot !== "ring2") return false;
  } else if (want !== slot) {
    return false;
  }

  // unequip if already in another slot
  for (const s of CONFIG.artifactSlots) {
    if (data.artifacts[s] === artifactId) data.artifacts[s] = null;
  }
  data.artifacts[slot] = artifactId;
  saveData(player);
  player.sendMessage(`§aEquipped: §e${art.name}`);
  return true;
}

export function unequipArtifact(player, slot) {
  const data = getData(player);
  if (!data.artifacts[slot]) return false;
  data.artifacts[slot] = null;
  saveData(player);
  return true;
}
