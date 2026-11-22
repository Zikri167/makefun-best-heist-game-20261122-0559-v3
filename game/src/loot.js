// Gilded Hour — loot pedestals: hold E to lift the treasure off its plinth.
import { CONFIG, dist } from './config.js';

export function makeLoot(level) {
  return level.loot.map((l) => ({ ...l, taken: false }));
}

export function lootTakenCount(loot) {
  return loot.filter((l) => l.taken).length;
}
export function lootTotalValue(loot) {
  return loot.filter((l) => l.taken).reduce((s, l) => s + l.value, 0);
}
export function allLootTaken(loot) {
  return loot.length > 0 && loot.every((l) => l.taken);
}

// Advance the pickup channel; returns the loot when the channel completes.
export function updateLootChannel(thief, dt) {
  if (!thief.lootTarget || thief.lootTarget.taken) return null;
  thief.lootProgress += dt / CONFIG.lootChannelSeconds;
  if (thief.lootProgress >= 1) {
    const l = thief.lootTarget;
    l.taken = true;
    thief.lootTarget = null;
    thief.lootProgress = 0;
    return l;
  }
  return null;
}

export function nearestLoot(thief, loot) {
  let best = null, bd = 1e9;
  for (const l of loot) {
    if (l.taken) continue;
    const d = dist(thief.x, thief.y, l.x, l.y);
    if (d < bd) { bd = d; best = l; }
  }
  return best;
}
