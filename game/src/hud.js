// Gilded Hour — HUD: big alarm meter with locked ratchet notches, loot total,
// tool counts, room name and timer; plus title / pause / caught / win screens.
import { CONFIG, PALETTE } from './config.js';
import { lootTakenCount, lootTotalValue } from './loot.js';
import { coinIcon } from './tools.js';

function drawAlarmMeter(ctx, game) {
  const x = 24, y = 16, w = 420, h = 26;
  const a = game.alarm;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x - 8, y - 8, w + 16, h + 34);
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('ALARM', x, y - 2 + 12);
  // Track.
  ctx.fillStyle = '#2a3247';
  ctx.fillRect(x, y + 12, w, h - 12);
  const col = a.value >= 70 ? '#e03131' : a.value >= 35 ? '#e8a33d' : '#e8b64c';
  ctx.fillStyle = col;
  ctx.fillRect(x, y + 12, (w * a.value) / 100, h - 12);
  // Ratchet notches: locked ones draw as gold padlocks.
  for (const n of CONFIG.alarmRatchets) {
    const nx = x + (w * n) / 100;
    ctx.strokeStyle = '#f2ead8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(nx, y + 8); ctx.lineTo(nx, y + h); ctx.stroke();
    const locked = a.ratchet >= n;
    ctx.fillStyle = locked ? '#ffd97a' : '#9aa5b8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(locked ? `${n}% 🔒` : `${n}%`, nx, y + h + 12);
  }
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.round(a.value)}%`, x + w + 14, y + 26);
  if (a.lockdown) {
    ctx.fillStyle = '#ff4d4d';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('LOCKDOWN!', x + w + 62, y + 26);
  }
}

export function drawHud(ctx, game) {
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, CONFIG.viewW, CONFIG.hudH);
  ctx.fillStyle = 'rgba(232,182,76,0.4)';
  ctx.fillRect(0, CONFIG.hudH - 2, CONFIG.viewW, 2);
  drawAlarmMeter(ctx, game);
  const taken = lootTakenCount(game.loot);
  const value = lootTotalValue(game.loot);
  ctx.fillStyle = '#ffd97a';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`💰 $${value.toLocaleString()}   ${taken}/${game.loot.length} loot`, 520, 34);
  ctx.fillStyle = '#f2ead8';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Wing ${game.level.id} — ${game.level.name}`, 520, 58);
  // Tools.
  coinIcon(ctx, 900, 30, 9);
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`× ${game.thief.coins}`, 914, 35);
  ctx.fillStyle = '#c8c8d8';
  ctx.beginPath(); ctx.arc(980, 30, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2ead8';
  ctx.fillText(`× ${game.thief.pellets}`, 994, 35);
  // Timer.
  const m = Math.floor(game.elapsed / 60), s = Math.floor(game.elapsed % 60);
  ctx.fillStyle = '#9aa5b8';
  ctx.font = '15px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, 1256, 34);
  ctx.fillStyle = '#9aa5b8';
  ctx.font = '12px sans-serif';
  ctx.fillText('M mute · P pause · R retry', 1256, 58);
  // Context prompt above the thief.
  const act = game.actionHint;
  if (act) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const w = ctx.measureText(act).width + 24;
    ctx.fillRect(game.thief.x - w / 2, game.thief.y - 58, w, 24);
    ctx.fillStyle = '#56dcff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(act, game.thief.x, game.thief.y - 41);
  }
  // Getaway banner (also in the deterministic getaway screenshot).
  if (game.allLoot && (game.screen === 'play' || game.screen === 'shot')) {
    ctx.fillStyle = '#2fbf71';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALL LOOT SECURED — GET TO THE GREEN EXIT!', CONFIG.viewW / 2, 108);
  }
  // "Seen by" flash.
  if (game.spotFlash > 0) {
    ctx.fillStyle = `rgba(224, 49, 49, ${Math.min(0.5, game.spotFlash)})`;
    ctx.fillRect(0, CONFIG.hudH, CONFIG.viewW, 6);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SPOTTED — ${game.spotFlashLabel}`, CONFIG.viewW / 2, 132);
  }
}

function panel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8, 10, 18, 0.82)';
  ctx.fillRect(0, 0, CONFIG.viewW, CONFIG.viewH);
  ctx.fillStyle = accent || '#e8b64c';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, CONFIG.viewW / 2, 250);
  ctx.fillStyle = '#f2ead8';
  ctx.font = '18px sans-serif';
  lines.forEach((ln, i) => ctx.fillText(ln, CONFIG.viewW / 2, 300 + i * 30));
}

export function drawTitle(ctx) {
  panel(ctx, 'GILDED HOUR', [
    'Heist at the Meridian Museum — you are MOTH, the cat burglar.',
    'Steal every treasure in all three wings, then slip out the green EXIT.',
    '',
    'WASD move · SHIFT sneak · E hold to take / hack / pick · Q or click throw coin',
    'F smoke pellet · R retry room · M mute · P pause',
    '',
    'Amber cones are guards. Red cones are cameras. Gold is loot. Green is freedom.',
    '',
    'Press ENTER or click to begin',
  ]);
}

export function drawPause(ctx) {
  panel(ctx, 'PAUSED', ['Press P to resume', 'R retries the room'], '#9aa5b8');
}

export function drawCaught(ctx, game) {
  panel(ctx, 'CAUGHT!', [
    game.caughtBy || 'A guard got you.',
    `Loot kept: $${lootTotalValue(game.loot).toLocaleString()} — but the night is over.`,
    '',
    'Press R to retry the room — or ENTER to restart the wing.',
  ], '#ff4d4d');
}

export function drawWin(ctx, game) {
  const bonus = game.seenCount === 0 ? 5000 : 0;
  const total = game.totalValue + bonus;
  const m = Math.floor(game.elapsed / 60), s = Math.floor(game.elapsed % 60);
  panel(ctx, 'CLEAN GETAWAY!', [
    `All treasures lifted across three wings — $${game.totalValue.toLocaleString()}`,
    `Time ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} · spotted ${game.seenCount} time${game.seenCount === 1 ? '' : 's'}`,
    bonus > 0 ? `GHOST bonus +$${bonus.toLocaleString()} — never seen once.` : 'Ghost bonus missed — they saw you.',
    '',
    `Final score: $${total.toLocaleString()}`,
    '',
    'Press ENTER to play again',
  ], '#2fbf71');
}
