// Gilded Hour — game state, main loop and screen flow.
import { CONFIG, clamp, dist } from './config.js';
import { LEVELS } from './levels.js';
import { rectsOf, hiddenNow } from './world.js';
import { makeThief, updateThief, nearbyAction } from './thief.js';
import { makeGuard, updateGuard, guardCaughtPlayer } from './guard.js';
import { makeCamera, updateCamera, disableCamera } from './camera.js';
import { makeAlarm, updateAlarm } from './alarm.js';
import { makeLoot, updateLootChannel, allLootTaken, lootTotalValue } from './loot.js';
import { cameraSeesPlayer } from './sight.js';
import { makeAudio } from './audio.js';
import { renderWorld } from './render.js';
import { drawHud, drawTitle, drawPause, drawCaught, drawWin } from './hud.js';
import { applyShot } from './shots.js';

export function createGame(canvas, input) {
  const ctx = canvas.getContext('2d');
  const audio = makeAudio();
  const game = {
    canvas, ctx, input, audio,
    screen: 'title', // title | play | pause | caught | win | shot
    levelIndex: 0, level: LEVELS[0], solids: [],
    thief: null, guards: [], cameras: [], loot: [],
    alarm: makeAlarm(), elapsed: 0, seenCount: 0,
    allLoot: false, getaway: false, caughtBy: '',
    spotFlash: 0, spotFlashLabel: '', actionHint: '',
    time: 0, shotTime: 0, lastStep: 0, alarmBlipTimer: 0,
    totalValue: 0,
  };

  game.loadLevel = function (idx) {
    game.levelIndex = idx;
    game.level = LEVELS[idx];
    game.solids = rectsOf(game.level);
    game.thief = makeThief(game.level.start);
    game.guards = game.level.guards.map(makeGuard);
    game.cameras = game.level.cameras.map(makeCamera);
    game.loot = makeLoot(game.level);
    game.alarm = makeAlarm();
    game.allLoot = false; game.getaway = false;
    game.spotFlash = 0; game.actionHint = '';
    game.elapsed = 0;
    game.seenCount = 0;
    game.caughtBy = '';
    game.screen = 'play';
  };

  game.retryRoom = function () {
    const idx = game.levelIndex;
    const kept = game.totalValue;
    game.loadLevel(idx);
    game.totalValue = kept;
  };

  game.nextLevel = function () {
    if (game.levelIndex + 1 < LEVELS.length) {
      game.loadLevel(game.levelIndex + 1);
    } else {
      game.screen = 'win';
      audio.win();
    }
  };

  function handleChannels(dt) {
    const thief = game.thief;
    const act = nearbyAction(thief, game.level, game.cameras, game.loot);
    game.actionHint = act ? act.label : '';
    if (!game.input.action) {
      thief.hackTarget = null; thief.hackProgress = 0;
      thief.lootTarget = null; thief.lootProgress = 0;
      thief.vaultProgress = 0;
      return;
    }
    if (!act) return;
    if (act.kind === 'hack') {
      thief.hackTarget = act.camera;
      thief.hackProgress += dt / CONFIG.hackSeconds;
      if (thief.hackProgress >= 1) {
        disableCamera(act.camera);
        thief.hackTarget = null; thief.hackProgress = 0;
        audio.hackDone();
      }
    } else if (act.kind === 'loot') {
      thief.lootTarget = act.loot;
      const got = updateLootChannel(thief, dt);
      if (got) {
        audio.loot();
        if (allLootTaken(game.loot)) { game.allLoot = true; game.getaway = true; }
      }
    } else if (act.kind === 'vault') {
      thief.vaultProgress += dt / 2.0;
      if (thief.vaultProgress >= 1) {
        game.level.vaultDoor.locked = false;
        game.solids = rectsOf(game.level);
        thief.vaultProgress = 0;
        audio.hackDone();
      }
    }
  }

  function update(dt) {
    game.time += dt;
    game.elapsed += dt;
    const thief = game.thief;
    updateThief(thief, game.input, game.level, dt, game.solids,
      () => audio.coin(), () => audio.tone(300, 0.15, 'triangle', 0.06, 120));
    handleChannels(dt);
    // Footsteps.
    game.lastStep += dt;
    if (thief.moving && game.lastStep > (thief.sneaking ? 0.55 : 0.32)) {
      game.lastStep = 0;
      audio.step(thief.sneaking);
    }
    // Cameras sweep and may spot Moth.
    let cameraSpot = null;
    for (const cam of game.cameras) {
      updateCamera(cam, game.time, dt);
      const r = cameraSeesPlayer(cam, thief, game.level, thief.smokes);
      if (r.seen && !cam.spotted) {
        cam.spotted = true;
        cameraSpot = cam;
        game.seenCount++;
        game.spotFlash = 1;
        game.spotFlashLabel = `CAMERA ${cam.id.toUpperCase()} SAW YOU`;
        game.alarm.lastSpottedBy = `camera ${cam.id}`;
        audio.alarmBlip();
      } else if (!r.seen) cam.spotted = false;
    }
    // Guards patrol, suspect, investigate, chase.
    const events = [];
    let anyChase = false, anySuspicious = false;
    for (const g of game.guards) {
      updateGuard(g, thief, game.level, dt, game.solids, game.alarm, events);
      if (g.state === 'chase') anyChase = true;
      if (g.state === 'suspicious' || g.state === 'investigate') anySuspicious = true;
      if (guardCaughtPlayer(g, thief)) {
        game.caughtBy = `${g.name} caught you in ${game.level.name}.`;
        game.screen = 'caught';
        audio.caught();
        return;
      }
    }
    for (const ev of events) {
      if (ev.type === 'suspicion') audio.question();
      if (ev.type === 'chase-start') {
        game.seenCount++;
        game.spotFlash = 1;
        game.spotFlashLabel = `${ev.guard.name.toUpperCase()} SAW YOU`;
        audio.alarmBlip();
      }
    }
    const hidden = hiddenNow(thief.x, thief.y, game.level, thief.smokes);
    updateAlarm(game.alarm, dt, anyChase, anySuspicious, !!cameraSpot, hidden, game.getaway);
    if (game.alarm.lockdown) {
      for (const g of game.guards) {
        if (g.state !== 'chase') { g.state = 'chase'; g.lastSeen = { x: thief.x, y: thief.y }; }
      }
    }
    game.spotFlash = Math.max(0, game.spotFlash - dt * 1.4);
    // Alarm blips speed up with the meter.
    if (game.alarm.value > 20) {
      game.alarmBlipTimer -= dt;
      if (game.alarmBlipTimer <= 0) {
        game.alarmBlipTimer = 1.6 - (game.alarm.value / 100) * 1.2;
        audio.alarmBlip();
      }
    }
    // Exit: only once every treasure in the wing is lifted.
    const e = game.level.exit;
    if (game.allLoot && thief.x > e.x - 10 && thief.x < e.x + e.w + 10 &&
        thief.y > e.y - 10 && thief.y < e.y + e.h + 30) {
      game.totalValue += lootTotalValue(game.loot);
      game.nextLevel();
    }
    if (game.input.consumeMute) audio.toggleMute();
    if (game.input.consumePause) game.screen = 'pause';
    if (game.input.consumeRetry) game.retryRoom();
  }

  function render() {
    const t = game.screen === 'shot' ? game.shotTime : game.time;
    ctx.clearRect(0, 0, CONFIG.viewW, CONFIG.viewH);
    ctx.fillStyle = '#0b0e16';
    ctx.fillRect(0, 0, CONFIG.viewW, CONFIG.viewH);
    renderWorld(ctx, game, t);
    drawHud(ctx, game);
    if (game.screen === 'title') drawTitle(ctx);
    else if (game.screen === 'pause') drawPause(ctx);
    else if (game.screen === 'caught') drawCaught(ctx, game);
    else if (game.screen === 'win') drawWin(ctx, game);
  }

  function frame(now) {
    const dt = clamp((now - (game._last || now)) / 1000, 0, 0.05);
    game._last = now;
    const inp = game.input;
    if (game.screen === 'title') {
      if (inp.consumeEnter) { game.totalValue = 0; game.loadLevel(0); }
    } else if (game.screen === 'play') {
      update(dt);
    } else if (game.screen === 'pause') {
      if (inp.consumePause) game.screen = 'play';
      if (inp.consumeRetry) game.retryRoom();
    } else if (game.screen === 'caught') {
      if (inp.consumeRetry || inp.consumeEnter) game.retryRoom();
    } else if (game.screen === 'win') {
      if (inp.consumeEnter) { game.totalValue = 0; game.loadLevel(0); }
    }
    if (game.screen !== 'shot') render();
    inp.endFrame();
    requestAnimationFrame(frame);
  }

  game.start = function (params) {
    const shot = params.get('shot');
    const seed = Number(params.get('seed') || '1');
    if (shot) {
      game.totalValue = 0;
      applyShot(game, shot, seed);
      game.audio.muted = true;
      render();
    } else {
      game.loadLevel(0);
      game.screen = 'title';
      render();
      requestAnimationFrame(frame);
    }
  };

  return game;
}
