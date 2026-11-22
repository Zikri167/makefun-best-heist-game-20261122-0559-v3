// Gilded Hour — deterministic screenshot scenes (?shot=cover|sneak|camera|getaway&seed=1).
// Every position, angle and meter value is fixed here, so the same query
// always renders the same frame.
import { CONFIG } from './config.js';

export const SHOT_NAMES = ['cover', 'sneak', 'camera', 'getaway'];

function setGuard(g, x, y, facing, state, suspicion) {
  g.x = x; g.y = y; g.facing = facing;
  g.state = state || 'patrol'; g.suspicion = suspicion || 0;
  g.bobPhase = 1.0; g.pauseTimer = 0;
}

export function applyShot(game, name, seed) {
  game.shotTime = 2.0;
  game.spotFlash = 0;
  game.elapsed = 0;
  const rng = seed;
  void rng;

  if (name === 'cover') {
    game.loadLevel(2); // Crown Room
    game.alarm.value = 28; game.alarm.ratchet = 0;
    game.thief.x = 640; game.thief.y = 430; game.thief.facing = -Math.PI / 2;
    setGuard(game.guards[0], 430, 430, 0, 'patrol', 0);
    setGuard(game.guards[1], 880, 430, Math.PI, 'patrol', 0);
    setGuard(game.guards[2], 640, 560, -Math.PI / 2, 'suspicious', 55);
    const cam = game.cameras[0];
    cam.angle = cam.base + 0.35; cam.disabled = 0; cam.phase = 0;
    game.cameras[1].angle = game.cameras[1].base - 0.4;
    game.cameras[2].angle = game.cameras[2].base + 0.2;
    game.elapsed = 96;
  } else if (name === 'sneak') {
    game.loadLevel(0); // The Gallery
    game.alarm.value = 12; game.alarm.ratchet = 0;
    game.thief.x = 225; game.thief.y = 112; game.thief.facing = 0;
    game.thief.sneaking = true; game.thief.inCurtain = true;
    setGuard(game.guards[1], 330, 130, 0, 'patrol', 0);
    setGuard(game.guards[0], 560, 560, -Math.PI / 2, 'patrol', 0);
    // A coin mid-flight toward the floor.
    game.thief.coinsThrown = [{ x: 300, y: 150, tx: 360, ty: 210, t: 0.2, landed: false }];
    game.cameras[0].angle = game.cameras[0].base - 0.5;
    game.elapsed = 41;
  } else if (name === 'camera') {
    game.loadLevel(1); // The Vault Hall
    game.alarm.value = 22; game.alarm.ratchet = 0;
    const cam = game.cameras[0];
    game.thief.x = cam.terminal.x; game.thief.y = cam.terminal.y + 6;
    game.thief.facing = Math.PI / 2;
    game.thief.hackTarget = cam;
    game.thief.hackProgress = 0.7;
    cam.angle = cam.base + 0.45; // sweeping away from Moth, cone nearby but clear
    cam.disabled = 0; cam.phase = 0;
    game.cameras[1].angle = game.cameras[1].base + 0.3;
    setGuard(game.guards[0], 300, 500, Math.PI / 2, 'patrol', 0);
    setGuard(game.guards[1], 760, 300, 0, 'patrol', 0);
    setGuard(game.guards[2], 1100, 480, Math.PI, 'investigate', 45);
    game.elapsed = 73;
  } else if (name === 'getaway') {
    game.loadLevel(2); // Crown Room
    game.alarm.value = 86; game.alarm.ratchet = 70;
    for (const l of game.loot) l.taken = true;
    game.allLoot = true;
    game.thief.x = 980; game.thief.y = 235; game.thief.facing = Math.PI / 4;
    game.thief.coins = 3; game.thief.pellets = 1;
    setGuard(game.guards[0], 820, 260, Math.PI / 4, 'chase', 100);
    setGuard(game.guards[1], 940, 330, Math.PI / 4, 'chase', 100);
    setGuard(game.guards[2], 760, 180, 0, 'chase', 100);
    game.cameras[0].angle = game.cameras[0].base + 0.3;
    game.cameras[0].disabled = 0;
    game.cameras[1].angle = game.cameras[1].base - 0.2;
    game.cameras[2].angle = game.cameras[2].base + 0.5;
    game.seenCount = 2;
    game.elapsed = 214;
  } else {
    game.loadLevel(0);
  }
  game.actionHint = '';
  game.thief.smokes = [];
  game.screen = 'shot'; // last: loadLevel above resets the screen to 'play'
  return game;
}
