// Gilded Hour — entry point: size the canvas, wire input, start the game.
import { createGame } from './main.js';
import { makeInput } from './input.js';

const canvas = document.getElementById('game');
const params = new URLSearchParams(window.location.search);
const input = makeInput(canvas);
const game = createGame(canvas, input);

function fit() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = 1280 * dpr;
  canvas.height = 720 * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fit();
window.addEventListener('resize', fit);

game.start(params);

// Debug bridge for the local playtest harness only (?debug=1). It never
// changes gameplay; it just lets the harness read state and teleport Moth.
if (params.get('debug')) {
  const tp = (x, y) => {
    game.thief.x = x; game.thief.y = y;
    for (const g of game.guards) {
      g.x = g.waypoints[0].x; g.y = g.waypoints[0].y; g.wpIndex = 0;
      g.state = 'patrol'; g.suspicion = 0; g.loseTimer = 0; g.pauseTimer = 0;
    }
  };
  window.__game = game;
  window.__pos = () => ({ x: game.thief.x, y: game.thief.y });
  window.__teleport = tp;
  window.__cam = (id) => { const c = game.cameras.find((c) => c.id === id); return { disabled: c.disabled }; };
  window.__loot = () => ({ taken: game.loot.filter((l) => l.taken).length, value: game.loot.filter((l) => l.taken).reduce((s, l) => s + l.value, 0) });
  window.__lootSpots = () => game.loot.map((l) => ({ x: l.x, y: l.y }));
  window.__coins = () => game.thief.coins;
  window.__alarm = () => ({ value: Math.round(game.alarm.value * 10) / 10, ratchet: game.alarm.ratchet });
  window.__exit = () => ({ x: game.level.exit.x, y: game.level.exit.y });
  window.__screen = () => game.screen;
  window.__holdE = (v) => { input.action = v; };
}
