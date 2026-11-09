import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { CONFIG } from "./config.js";
import { getData, saveData, getDerived } from "./data.js";
import { canUnlockSkill, unlockSkill, equipArtifact, unequipArtifact, giveArtifact } from "./progression.js";

export async function openMainMenu(player) {
  const data = getData(player);
  if (!data.classId) {
    await showClassSelect(player);
    return;
  }

  const form = new ActionFormData()
    .title("§l§6RPG System")
    .body(
      `§eClass: §f${data.classId}\n` +
      `§eLevel: §f${data.level}   §7EXP §f${data.exp}/${data.expToNext}\n` +
      `§aAttr Pts: §f${data.attrPoints}   §bSkill Pts: §f${data.skillPoints}`
    )
    .button("§aStatus")
    .button("§bSkill Tree")
    .button("§dArtifacts")
    .button("§eOverview")
    .button("§6Admin: Give Test Artifacts")
    .button("§7Close");

  const res = await form.show(player);
  if (res.canceled || res.selection === 5) return;

  switch (res.selection) {
    case 0: return openAttributes(player);
    case 1: return openSkillTree(player);
    case 2: return openArtifacts(player);
    case 3: return openOverview(player);
    case 4: return giveTestArtifacts(player);
  }
}

async function showClassSelect(player) {
  const form = new ActionFormData()
    .title("§l§6Choose Class")
    .body("This choice is permanent.");
  for (const c of CONFIG.classes) form.button(c);

  const res = await form.show(player);
  if (res.canceled) return;

  const chosen = CONFIG.classes[res.selection];
  const data = getData(player);
  data.classId = chosen;
  data.attributes = { ...CONFIG.classBases[chosen] };
  saveData(player);
  player.sendMessage(`§aClass: §e${chosen}`);
  player.sendMessage("§7Type §f!rpg §7for menu");
}

async function openAttributes(player) {
  const data = getData(player);
  const a = data.attributes;

  const form = new ActionFormData()
    .title("§l§aAttributes")
    .body(
      `§7Points: §a${data.attrPoints}\n\n` +
      `§cSTR §f${a.str}  §aAGI §f${a.agi}  §eVIT §f${a.vit}\n` +
      `§bINT §f${a.int}  §dDEX §f${a.dex}  §6LUK §f${a.luk}`
    )
    .button("§c+ STR").button("§a+ AGI").button("§e+ VIT")
    .button("§b+ INT").button("§d+ DEX").button("§6+ LUK")
    .button("§7Back");

  const res = await form.show(player);
  if (res.canceled || res.selection === 6) return openMainMenu(player);

  if (data.attrPoints <= 0) {
    player.sendMessage("§cNo points left");
    return openAttributes(player);
  }
  const keys = ["str", "agi", "vit", "int", "dex", "luk"];
  data.attributes[keys[res.selection]]++;
  data.attrPoints--;
  saveData(player);
  return openAttributes(player);
}

async function openSkillTree(player) {
  const data = getData(player);

  const form = new ActionFormData()
    .title("§l§bSkill Tree")
    .body(`§e${data.classId}  §7Pts: §a${data.skillPoints}`)
    .button("§aGeneral Skills")
    .button(`§e${data.classId} Skills`)
    .button("§7Back");

  const res = await form.show(player);
  if (res.canceled || res.selection === 2) return openMainMenu(player);

  const filterClass = res.selection === 1 ? data.classId : null;
  return openSkillList(player, filterClass);
}

async function openSkillList(player, classFilter) {
  const data = getData(player);
  const list = Object.entries(CONFIG.skills).filter(([id, sk]) => {
    if (classFilter) return sk.class === classFilter;
    return !sk.class;
  });

  const form = new ActionFormData()
    .title(classFilter ? `§l§e${classFilter}` : "§l§aGeneral")
    .body(`§7Pts: §a${data.skillPoints}`);

  for (const [id, sk] of list) {
    const owned = data.skills.includes(id) ? "§a✓ " : "§7";
    const lock = canUnlockSkill(data, id) ? "§f" : "§8";
    form.button(`${owned}${lock}${sk.name} §7(Lv${sk.reqLevel} · ${sk.cost}pt)`);
  }
  form.button("§7Back");

  const res = await form.show(player);
  if (res.canceled || res.selection === list.length) {
    return openSkillTree(player);
  }

  const [skillId] = list[res.selection];
  if (data.skills.includes(skillId)) {
    player.sendMessage("§7Already unlocked");
  } else if (canUnlockSkill(data, skillId)) {
    unlockSkill(player, skillId);
  } else {
    player.sendMessage("§cCannot unlock yet");
  }
  return openSkillList(player, classFilter);
}

async function openArtifacts(player) {
  const data = getData(player);
  const lines = CONFIG.artifactSlots.map((s) => {
    const id = data.artifacts[s];
    const name = id ? CONFIG.artifacts[id]?.name : "—";
    return `§e${s}: §f${name}`;
  });

  const form = new ActionFormData()
    .title("§l§dArtifacts")
    .body(lines.join("\n") + `\n\n§7Owned: §f${data.ownedArtifacts.length}`)
    .button("§aEquip from Owned")
    .button("§cUnequip Slot")
    .button("§7Back");

  const res = await form.show(player);
  if (res.canceled || res.selection === 2) return openMainMenu(player);
  if (res.selection === 0) return openEquipList(player);
  return openUnequip(player);
}

async function openEquipList(player) {
  const data = getData(player);
  if (data.ownedArtifacts.length === 0) {
    player.sendMessage("§cNo artifacts owned");
    return openArtifacts(player);
  }

  const form = new ActionFormData().title("§l§aSelect Artifact");
  for (const id of data.ownedArtifacts) {
    const a = CONFIG.artifacts[id];
    form.button(`§e${a.name}\n§7${a.rarity} · ${a.slot}`);
  }
  form.button("§7Back");

  const res = await form.show(player);
  if (res.canceled || res.selection === data.ownedArtifacts.length) {
    return openArtifacts(player);
  }

  const artId = data.ownedArtifacts[res.selection];
  const art = CONFIG.artifacts[artId];

  // choose slot
  let slots = [];
  if (art.slot === "ring") slots = ["ring1", "ring2"];
  else slots = [art.slot];

  if (slots.length === 1) {
    equipArtifact(player, artId, slots[0]);
    return openArtifacts(player);
  }

  const slotForm = new ActionFormData().title("§lChoose Ring Slot");
  for (const s of slots) slotForm.button(s);
  slotForm.button("§7Cancel");
  const sr = await slotForm.show(player);
  if (!sr.canceled && sr.selection < slots.length) {
    equipArtifact(player, artId, slots[sr.selection]);
  }
  return openArtifacts(player);
}

async function openUnequip(player) {
  const data = getData(player);
  const form = new ActionFormData().title("§l§cUnequip");
  for (const s of CONFIG.artifactSlots) {
    const id = data.artifacts[s];
    form.button(`${s}: ${id ? CONFIG.artifacts[id].name : "—"}`);
  }
  form.button("§7Back");

  const res = await form.show(player);
  if (res.canceled || res.selection === CONFIG.artifactSlots.length) {
    return openArtifacts(player);
  }
  unequipArtifact(player, CONFIG.artifactSlots[res.selection]);
  return openArtifacts(player);
}

async function openOverview(player) {
  const data = getData(player);
  const d = getDerived(data);
  const a = d.attrs;

  const form = new MessageFormData()
    .title("§l§eOverview")
    .body(
      `§6Attributes\n` +
      `STR ${a.str}  AGI ${a.agi}  VIT ${a.vit}\n` +
      `INT ${a.int}  DEX ${a.dex}  LUK ${a.luk}\n\n` +
      `§6Derived\n` +
      `HP Cap: §f${d.maxHp}  Mana: §f${d.maxMana}\n` +
      `Melee +: §f${d.meleeBonus.toFixed(1)}  Def: §f${d.defense.toFixed(1)}\n` +
      `Crit: §f${d.critChance.toFixed(1)}%  x${d.critDamage.toFixed(2)}\n` +
      `EXP Bonus: §f${(d.expBonus * 100).toFixed(0)}%\n\n` +
      `§7Skills unlocked: §f${data.skills.length}`
    )
    .button1("OK")
    .button2("Back");

  await form.show(player);
  return openMainMenu(player);
}

async function giveTestArtifacts(player) {
  const ids = Object.keys(CONFIG.artifacts);
  let n = 0;
  for (const id of ids) {
    if (giveArtifact(player, id)) n++;
  }
  player.sendMessage(`§aGranted ${n} artifacts for testing`);
  return openMainMenu(player);
}
