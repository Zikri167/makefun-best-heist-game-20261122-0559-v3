// Gilded Hour — Moth the cat burglar: movement, sneak, coins, smoke, hack, loot.
import { CONFIG, clamp, dist } from './config.js';
import { moveCircle, rectsOf, insideVent, insideCurtain } from './world.js';

export function makeThief(start) {
  return {
    x: start.x, y: start.y, radius: CONFIG.playerRadius,
    facing: -Math.PI / 2, moving: false, sneaking: false,
    coins: CONFIG.coinCount, pellets: CONFIG.pelletCount,
    hackTarget: null, hackProgress: 0,
    lootTarget: null, lootProgress: 0,
    vaultProgress: 0,
    seenCount: 0, caughtBy: null,
    coinsThrown: [], smokes: [],
    channelLabel: '',
  };
}

export function updateThief(thief, input, level, dt, solids, onCoin, onSmoke) {
  let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const len = Math.hypot(mx, my);
  thief.moving = len > 0;
  thief.sneaking = !!input.sneak;
  const inVent = insideVent(thief.x, thief.y, level);
  let speed = thief.sneaking ? CONFIG.sneakSpeed : CONFIG.walkSpeed;
  if (inVent) speed = CONFIG.ventSpeed;
  if (len > 0) {
    mx /= len; my /= len;
    thief.facing = Math.atan2(my, mx);
    const moved = moveCircle(thief.x, thief.y, mx * speed * dt, my * speed * dt,
      thief.radius, solids);
    thief.x = moved.x; thief.y = moved.y;
  }
  // Channelled actions cancel the moment Moth walks away.
  if (thief.hackTarget) {
    const t = thief.hackTarget;
    if (dist(thief.x, thief.y, t.terminal.x, t.terminal.y) > 46 || !input.action) {
      thief.hackTarget = null; thief.hackProgress = 0;
    }
  }
  if (thief.lootTarget) {
    const l = thief.lootTarget;
    if (l.taken || dist(thief.x, thief.y, l.x, l.y) > 52 || !input.action) {
      thief.lootTarget = null; thief.lootProgress = 0;
    }
  }
  // Coin throw: Q or a mouse click lobs a coin at the cursor.
  if (input.consumeCoin && thief.coins > 0) {
    thief.coins--;
    const c = { x: thief.x, y: thief.y, tx: input.coinX, ty: input.coinY, t: 0, landed: false };
    thief.coinsThrown.push(c);
    onCoin && onCoin();
  }
  if (input.consumeSmoke && thief.pellets > 0) {
    thief.pellets--;
    thief.smokes.push({ x: thief.x, y: thief.y, radius: CONFIG.smokeRadius, t: CONFIG.smokeSeconds });
    onSmoke && onSmoke();
  }
  // Flying coins arc to their target, then sit on the floor and jingle.
  for (const c of thief.coinsThrown) {
    if (c.landed) continue;
    c.t += dt;
    const k = clamp(c.t / 0.45, 0, 1);
    c.x = c.x + (c.tx - c.x) * k * 0.35;
    c.y = c.y + (c.ty - c.y) * k * 0.35;
    if (k >= 1) { c.landed = true; c.x = c.tx; c.y = c.ty; }
  }
  thief.coinsThrown = thief.coinsThrown.filter((c) => c.landed || c.t < 2);
  for (const s of thief.smokes) s.t -= dt;
  thief.smokes = thief.smokes.filter((s) => s.t > 0);
  thief.inVent = inVent;
  thief.inCurtain = insideCurtain(thief.x, thief.y, level);
  return thief;
}

// What can Moth do right here? Priority: hack terminal > loot > vault door.
// `loot` is the live per-run copy (game.loot), not the level definition.
export function nearbyAction(thief, level, cameras, loot) {
  for (const cam of cameras) {
    if (cam.disabled <= 0 && dist(thief.x, thief.y, cam.terminal.x, cam.terminal.y) < 46) {
      return { kind: 'hack', camera: cam, label: 'HOLD E — HACK CAMERA' };
    }
  }
  for (const l of loot) {
    if (!l.taken && dist(thief.x, thief.y, l.x, l.y) < 52) {
      return { kind: 'loot', loot: l, label: `HOLD E — TAKE ${l.name.toUpperCase()}` };
    }
  }
  if (level.vaultDoor && level.vaultDoor.locked &&
      dist(thief.x, thief.y, level.vaultDoor.x + 8, level.vaultDoor.y + 55) < 60) {
    return { kind: 'vault', label: 'HOLD E — PICK VAULT LOCK' };
  }
  return null;
}
