import { getData, getDerived } from "./data.js";

/** Apply outgoing damage bonus / crit when player hits something */
export function onPlayerHit(attacker, target, hurtEvent) {
  if (!attacker || !attacker.isValid) return;
  const data = getData(attacker);
  if (!data.classId) return;

  const d = getDerived(data);
  let bonus = d.meleeBonus;

  // light class bias
  if (data.classId === "Archer") bonus = d.rangedBonus;
  if (data.classId === "Mage" || data.classId === "Cleric") bonus = d.magicBonus * 0.6;

  const isCrit = Math.random() * 100 < d.critChance;
  let extra = bonus;
  if (isCrit) {
    extra = bonus * d.critDamage + (hurtEvent?.damage ?? 1) * (d.critDamage - 1) * 0.5;
    try {
      attacker.playSound("random.anvil_land", { pitch: 1.4, volume: 0.4 });
    } catch (_) {}
  }

  if (extra > 0.5 && target?.isValid) {
    try {
      target.applyDamage(Math.floor(extra), { cause: "entityAttack", damagingEntity: attacker });
    } catch (_) {}
  }
}

/** Reduce incoming damage using defense */
export function onPlayerHurt(player, damage) {
  const data = getData(player);
  if (!data.classId) return damage;
  const d = getDerived(data);
  const reduced = Math.max(1, damage - d.defense * 0.5);
  return reduced;
}
