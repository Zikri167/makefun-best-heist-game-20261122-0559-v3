// Gilded Hour — all drawing: warm night museum, pleated velvet curtains,
// spotlight pools, dotted patrol tracks, colour-coded threat cones.
import { CONFIG, PALETTE, dist } from './config.js';
import { coinIcon, drawSmoke } from './tools.js';

function conePath(ctx, x, y, facing, range, half) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - half, facing + half);
  ctx.closePath();
}

function drawFloor(ctx, level) {
  const a = level.arena;
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(a.x, a.y, a.w, a.h);
  // Parquet tile grid, faint.
  ctx.strokeStyle = 'rgba(232, 182, 76, 0.07)';
  ctx.lineWidth = 1;
  for (let x = a.x; x <= a.x + a.w; x += 56) {
    ctx.beginPath(); ctx.moveTo(x, a.y); ctx.lineTo(x, a.y + a.h); ctx.stroke();
  }
  for (let y = a.y; y <= a.y + a.h; y += 56) {
    ctx.beginPath(); ctx.moveTo(a.x, y); ctx.lineTo(a.x + a.w, y); ctx.stroke();
  }
  // Red carpet down the main hall.
  ctx.fillStyle = PALETTE.carpet;
  ctx.fillRect(a.x + 560, a.y, 88, a.h);
  ctx.fillStyle = PALETTE.carpetEdge;
  ctx.fillRect(a.x + 560, a.y, 4, a.h);
  ctx.fillRect(a.x + 644, a.y, 4, a.h);
  // Gold-framed paintings on the walls.
  const frames = [
    [a.x + 120, a.y + 8, 70, 44], [a.x + 760, a.y + 8, 70, 44],
    [a.x + 120, a.y + a.h - 52, 70, 44], [a.x + 960, a.y + a.h - 52, 70, 44],
  ];
  for (const [fx, fy, fw, fh] of frames) {
    ctx.fillStyle = '#3a2c12';
    ctx.fillRect(fx - 4, fy - 4, fw + 8, fh + 8);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(fx - 2, fy - 2, fw + 4, fh + 4);
    ctx.fillStyle = '#24344f';
    ctx.fillRect(fx, fy, fw, fh);
    ctx.fillStyle = 'rgba(232,182,76,0.35)';
    ctx.beginPath(); ctx.arc(fx + fw / 2, fy + fh / 2, 9, 0, Math.PI * 2); ctx.fill();
  }
}

function drawWalls(ctx, level) {
  ctx.fillStyle = PALETTE.wall;
  ctx.strokeStyle = PALETTE.wallEdge;
  ctx.lineWidth = 2;
  const a = level.arena;
  const all = [
    { x: a.x - 14, y: a.y - 14, w: a.w + 28, h: 14 },
    { x: a.x - 14, y: a.y + a.h, w: a.w + 28, h: 14 },
    { x: a.x - 14, y: a.y, w: 14, h: a.h },
    { x: a.x + a.w, y: a.y, w: 14, h: a.h },
    ...level.walls,
  ];
  for (const w of all) {
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }
  if (level.vaultDoor) {
    const d = level.vaultDoor;
    ctx.fillStyle = d.locked ? '#5a4a1a' : '#2fbf71';
    ctx.fillRect(d.x, d.y, d.w, d.h);
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath(); ctx.arc(d.x + 8, d.y + d.h / 2, 6, 0, Math.PI * 2); ctx.fill();
  }
}

function drawCurtains(ctx, level, t) {
  for (const c of level.curtains) {
    const vertical = c.h > c.w;
    ctx.save();
    // Pleats: alternating dark/light arcs along the curtain length.
    const n = Math.floor((vertical ? c.h : c.w) / 14);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i % 2 ? PALETTE.curtain : PALETTE.curtainHi;
      if (vertical) ctx.fillRect(c.x, c.y + i * 14, c.w, 14);
      else ctx.fillRect(c.x + i * 14, c.y, 14, c.h);
    }
    ctx.strokeStyle = PALETTE.curtainDark;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    // Gold rod.
    ctx.fillStyle = PALETTE.gold;
    if (vertical) ctx.fillRect(c.x - 3, c.y - 3, 6, c.h + 6);
    else ctx.fillRect(c.x - 3, c.y - 3, c.w + 6, 6);
    ctx.restore();
  }
}

function drawCases(ctx, level) {
  for (const c of level.cases) {
    ctx.fillStyle = '#1d2b45';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = 'rgba(160, 200, 240, 0.28)';
    ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = 'rgba(232,182,76,0.5)';
    ctx.beginPath(); ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 7, 0, Math.PI * 2); ctx.fill();
  }
}

function drawVents(ctx, level) {
  for (const v of level.vents) {
    ctx.fillStyle = '#141a26';
    ctx.fillRect(v.x, v.y, v.w, v.h);
    ctx.strokeStyle = '#4a5a75';
    ctx.lineWidth = 2;
    ctx.strokeRect(v.x, v.y, v.w, v.h);
    ctx.strokeStyle = 'rgba(120,140,170,0.5)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      const y = v.y + (v.h / 6) * i;
      ctx.beginPath(); ctx.moveTo(v.x + 6, y); ctx.lineTo(v.x + v.w - 6, y); ctx.stroke();
    }
  }
}

function drawPatrolTracks(ctx, level) {
  ctx.fillStyle = 'rgba(232, 182, 76, 0.35)';
  for (const g of level.guards) {
    const wps = g.waypoints;
    for (let i = 0; i < wps.length; i++) {
      const [x1, y1] = wps[i], [x2, y2] = wps[(i + 1) % wps.length];
      const d = dist(x1, y1, x2, y2);
      const n = Math.floor(d / 26);
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        ctx.beginPath();
        ctx.arc(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawLoot(ctx, level, loot, t) {
  for (const l of loot) {
    if (l.taken) continue;
    // Warm spotlight pool on the floor.
    const g = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, 78);
    g.addColorStop(0, 'rgba(255, 214, 130, 0.34)');
    g.addColorStop(1, 'rgba(255, 214, 130, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(l.x, l.y, 78, 0, Math.PI * 2); ctx.fill();
    // Marble plinth.
    ctx.fillStyle = PALETTE.marble;
    ctx.fillRect(l.x - 22, l.y - 16, 44, 32);
    ctx.fillStyle = '#b9b2a2';
    ctx.fillRect(l.x - 22, l.y + 12, 44, 4);
    ctx.strokeStyle = '#8f887a';
    ctx.lineWidth = 1;
    ctx.strokeRect(l.x - 22, l.y - 16, 44, 32);
    // The treasure itself, gently bobbing and sparkling.
    const bob = Math.sin(t * 2 + l.x) * 2;
    const spark = 0.6 + 0.4 * Math.sin(t * 5 + l.y);
    ctx.fillStyle = PALETTE.goldBright;
    ctx.save();
    ctx.shadowColor = '#ffd97a'; ctx.shadowBlur = 14 * spark;
    ctx.beginPath(); ctx.arc(l.x, l.y - 26 + bob, 11, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#8a6a1f';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('$', l.x, l.y - 25 + bob);
    ctx.fillStyle = '#f2ead8';
    ctx.font = '11px sans-serif';
    ctx.fillText(l.name, l.x, l.y + 32);
  }
}

function drawTerminalsAndCables(ctx, cameras, t) {
  for (const cam of cameras) {
    if (cam.disabled > 0) continue;
    // Glowing floor cable from terminal to its camera.
    const pulse = 0.5 + 0.3 * Math.sin(t * 4);
    ctx.save();
    ctx.strokeStyle = `rgba(86, 220, 255, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = '#56dcff'; ctx.shadowBlur = 8;
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = -t * 30;
    ctx.beginPath();
    ctx.moveTo(cam.terminal.x, cam.terminal.y);
    const mx = (cam.terminal.x + cam.x) / 2, my = Math.max(cam.terminal.y, cam.y) + 40;
    ctx.quadraticCurveTo(mx, my, cam.x, cam.y);
    ctx.stroke();
    ctx.restore();
    // Terminal box.
    ctx.fillStyle = '#12333d';
    ctx.fillRect(cam.terminal.x - 13, cam.terminal.y - 13, 26, 26);
    ctx.strokeStyle = '#56dcff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cam.terminal.x - 13, cam.terminal.y - 13, 26, 26);
    ctx.fillStyle = '#56dcff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('⌘', cam.terminal.x, cam.terminal.y + 1);
  }
}

function drawCamera(ctx, cam, t) {
  const half = (CONFIG.cameraHalfAngleDeg * Math.PI) / 180;
  const disabled = cam.disabled > 0;
  if (!disabled) {
    ctx.fillStyle = PALETTE.cameraCone;
    conePath(ctx, cam.x, cam.y, cam.angle, cam.range, half);
    ctx.fill();
    ctx.strokeStyle = PALETTE.cameraConeEdge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(150, 160, 175, 0.10)';
    conePath(ctx, cam.x, cam.y, cam.angle, cam.range, half);
    ctx.fill();
  }
  // Camera body on a wall mount.
  ctx.fillStyle = '#20242e';
  ctx.beginPath(); ctx.arc(cam.x, cam.y, 11, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = disabled ? '#9aa5b8' : '#e03131';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = disabled ? '#9aa5b8' : '#ff5a5a';
  ctx.beginPath(); ctx.arc(cam.x, cam.y, 4, 0, Math.PI * 2); ctx.fill();
  if (disabled) {
    ctx.fillStyle = '#dfe6f2';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`OFF ${Math.ceil(cam.disabled)}s`, cam.x, cam.y - 22);
  }
}

function drawGuard(ctx, g, t) {
  const half = (CONFIG.guardHalfAngleDeg * Math.PI) / 180;
  ctx.fillStyle = g.state === 'chase' ? 'rgba(224,49,49,0.22)' : PALETTE.guardCone;
  conePath(ctx, g.x, g.y, g.facing, g.state === 'chase' ? 260 : CONFIG.guardSightRange, half);
  ctx.fill();
  ctx.strokeStyle = g.state === 'chase' ? 'rgba(224,49,49,0.6)' : PALETTE.guardConeEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Body: dark uniform with gold trim, bobbing as it walks.
  const bob = Math.sin(g.bobPhase) * 1.5;
  ctx.fillStyle = '#232a3a';
  ctx.beginPath(); ctx.arc(g.x, g.y + bob * 0.3, 14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath(); ctx.arc(g.x, g.y + bob * 0.3 - 4, 6, 0, Math.PI * 2); ctx.fill();
  // Facing tick.
  ctx.strokeStyle = '#f2ead8';
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(g.x + Math.cos(g.facing) * 20, g.y + Math.sin(g.facing) * 20);
  ctx.stroke();
  // Telegraph: "?" amber while suspicious, "!" red while chasing.
  if (g.state === 'suspicious' || g.state === 'investigate') {
    ctx.fillStyle = '#e8b64c';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', g.x, g.y - 26);
  } else if (g.state === 'chase') {
    const pulse = 1 + 0.15 * Math.sin(t * 10);
    ctx.fillStyle = '#ff4d4d';
    ctx.font = `bold ${Math.round(30 * pulse)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('!', g.x, g.y - 28);
  }
  // Suspicion arc under the guard.
  if (g.suspicion > 0 && g.state !== 'chase') {
    ctx.strokeStyle = '#e8b64c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.x, g.y + 18, 10, -Math.PI / 2, -Math.PI / 2 + (g.suspicion / 100) * Math.PI * 2);
    ctx.stroke();
  }
}

function drawThief(ctx, thief, t) {
  const hidden = thief.inCurtain || thief.inVent;
  ctx.save();
  if (hidden) ctx.globalAlpha = 0.45;
  // Moth: black cloak, wide-brim hat, gold mask glint.
  ctx.fillStyle = '#0d0d12';
  ctx.beginPath(); ctx.arc(thief.x, thief.y, 13, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.goldBright;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#0d0d12';
  ctx.beginPath(); ctx.ellipse(thief.x, thief.y - 4, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.goldBright;
  ctx.beginPath(); ctx.arc(thief.x + Math.cos(thief.facing) * 5, thief.y + Math.sin(thief.facing) * 5, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (thief.sneaking) {
    ctx.fillStyle = 'rgba(242, 234, 216, 0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('sneak', thief.x, thief.y - 22);
  }
  // Radial progress ring for hack / loot / vault channels.
  let prog = 0, color = '#56dcff';
  if (thief.hackTarget) { prog = thief.hackProgress; color = '#56dcff'; }
  else if (thief.lootTarget) { prog = thief.lootProgress; color = '#ffd97a'; }
  else if (thief.vaultProgress > 0) { prog = thief.vaultProgress; color = '#e8b64c'; }
  if (prog > 0) {
    ctx.strokeStyle = 'rgba(242,234,216,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(thief.x, thief.y, 22, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 22, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
    ctx.stroke();
  }
}

function drawExit(ctx, level, active, t) {
  const e = level.exit;
  const glow = active ? 0.6 + 0.3 * Math.sin(t * 4) : 0.25;
  ctx.fillStyle = `rgba(47, 191, 113, ${glow})`;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = PALETTE.exitGreen;
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = '#eafff3';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(active ? 'EXIT' : 'EXIT 🔒', e.x + e.w / 2, e.y + e.h / 2);
}

export function renderWorld(ctx, game, t) {
  const level = game.level;
  drawFloor(ctx, level);
  drawPatrolTracks(ctx, level);
  drawVents(ctx, level);
  drawWalls(ctx, level);
  drawCases(ctx, level);
  drawCurtains(ctx, level, t);
  drawLoot(ctx, level, game.loot, t);
  drawTerminalsAndCables(ctx, game.cameras, t);
  drawExit(ctx, level, game.allLoot, t);
  for (const cam of game.cameras) drawCamera(ctx, cam, t);
  for (const g of game.guards) drawGuard(ctx, g, t);
  for (const c of game.thief.coinsThrown) {
    if (c.landed) coinIcon(ctx, c.x, c.y, 7);
    else {
      // A flying coin gets a gold glint trail so the throw reads in a still frame.
      ctx.save();
      ctx.strokeStyle = 'rgba(232, 182, 76, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(c.x - (c.tx - c.x) * 0.12, c.y - (c.ty - c.y) * 0.12);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();
      ctx.restore();
      coinIcon(ctx, c.x, c.y, 8);
    }
  }
  for (const s of game.thief.smokes) drawSmoke(ctx, s);
  drawThief(ctx, game.thief, t);
}
