import { world, system } from "@minecraft/server";
import { CONFIG } from "./config.js";
import { loadData, saveData, clearData, getData } from "./data.js";
import { openMainMenu } from "./ui.js";
import { addExp, getExpForKill } from "./progression.js";
import { onPlayerHit } from "./combat.js";

const SAVE_INTERVAL = 200;

// First join / respawn load
world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return;
  const player = ev.player;
  loadData(player);
  const data = getData(player);
  if (!data.classId) {
    system.runTimeout(() => openMainMenu(player), 40);
  } else {
    player.sendMessage("§7[RPG] Loaded · §f/rpg");
  }
});

world.afterEvents.playerLeave.subscribe((ev) => {
  clearData(ev.playerId);
});

// Chat command
world.beforeEvents.chatSend.subscribe((ev) => {
  const msg = ev.message.trim().toLowerCase();
  if (msg === "/rpg" || msg === "/menu") {
    ev.cancel = true;
    system.run(() => openMainMenu(ev.sender));
  }
});

// EXP on kill
world.afterEvents.entityDie.subscribe((ev) => {
  const dead = ev.deadEntity;
  if (!dead || dead.typeId === "minecraft:player") return;

  const source = ev.damageSource?.damagingEntity;
  if (!source || source.typeId !== "minecraft:player") return;

  const exp = getExpForKill(dead.typeId);
  addExp(source, exp);
});

// Combat bonus on hit
world.afterEvents.entityHitEntity.subscribe((ev) => {
  const attacker = ev.damagingEntity;
  const target = ev.hitEntity;
  if (!attacker || attacker.typeId !== "minecraft:player") return;
  if (!target || !target.isValid) return;
  onPlayerHit(attacker, target, ev);
});

// Periodic save
system.runInterval(() => {
  for (const p of world.getAllPlayers()) {
    saveData(p);
  }
}, SAVE_INTERVAL);

console.log("[RPG System] Fully loaded");
if (CONFIG.debug) console.warn("[RPG] debug on");
