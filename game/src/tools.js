// Gilded Hour — tools: thrown coins that jingle and lure guards, and smoke
// pellets that break line of sight for a few seconds.
import { CONFIG } from './config.js';

export function coinIcon(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = '#e8b64c';
  ctx.strokeStyle = '#8a6a1f';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#8a6a1f';
  ctx.font = `bold ${Math.round(r * 1.1)}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('¢', x, y + 0.5);
  ctx.restore();
}

export function drawSmoke(ctx, smoke) {
  const a = Math.min(1, smoke.t / 1.2) * 0.75;
  const g = ctx.createRadialGradient(smoke.x, smoke.y, 6, smoke.x, smoke.y, smoke.radius);
  g.addColorStop(0, `rgba(210, 210, 220, ${a})`);
  g.addColorStop(0.7, `rgba(170, 170, 185, ${a * 0.7})`);
  g.addColorStop(1, 'rgba(170, 170, 185, 0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(smoke.x, smoke.y, smoke.radius, 0, Math.PI * 2); ctx.fill();
}
