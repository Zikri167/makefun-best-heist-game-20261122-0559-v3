// Gilded Hour — grid-free world: rectangle collision and line-of-sight.
import { CONFIG } from './config.js';

export function rectsOf(level) {
  const solids = [];
  const a = level.arena;
  // Border walls (thick, just outside the arena edge).
  solids.push({ x: a.x - 14, y: a.y - 14, w: a.w + 28, h: 14 }); // top
  solids.push({ x: a.x - 14, y: a.y + a.h, w: a.w + 28, h: 14 }); // bottom
  solids.push({ x: a.x - 14, y: a.y, w: 14, h: a.h }); // left
  solids.push({ x: a.x + a.w, y: a.y, w: 14, h: a.h }); // right
  for (const w of level.walls) solids.push(w);
  for (const c of level.cases) solids.push(c);
  if (level.vaultDoor && level.vaultDoor.locked) solids.push(level.vaultDoor);
  return solids;
}

export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx, dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

// Move a circle against solid rects, axis by axis so it slides along walls.
export function moveCircle(x, y, dx, dy, radius, solids) {
  let nx = x + dx;
  for (const s of solids) {
    if (circleHitsRect(nx, y, radius, s)) {
      nx = dx > 0 ? s.x - radius : dx < 0 ? s.x + s.w + radius : nx;
      if (circleHitsRect(nx, y, radius, s)) nx = x;
    }
  }
  let ny = y + dy;
  for (const s of solids) {
    if (circleHitsRect(nx, ny, radius, s)) {
      ny = dy > 0 ? s.y - radius : dy < 0 ? s.y + s.h + radius : ny;
      if (circleHitsRect(nx, ny, radius, s)) ny = y;
    }
  }
  return { x: nx, y: ny };
}

// Segment vs rectangle intersection (Liang-Barsky). True if the segment touches.
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; }
    else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}

// Line of sight between two points: blocked by walls and display cases,
// never by curtains, vents or the thief's own smoke (handled by caller).
export function hasLineOfSight(x1, y1, x2, y2, level) {
  for (const s of rectsOf(level)) {
    if (segmentHitsRect(x1, y1, x2, y2, s)) return false;
  }
  return true;
}

export function insideCurtain(x, y, level) {
  return level.curtains.some((c) => pointInRect(x, y, c));
}
export function insideVent(x, y, level) {
  return level.vents.some((v) => pointInRect(x, y, v));
}
export function insideSmoke(x, y, smokes) {
  return smokes.some((s) => Math.hypot(x - s.x, y - s.y) < s.radius);
}
export function hiddenNow(x, y, level, smokes) {
  return insideCurtain(x, y, level) || insideVent(x, y, level) || insideSmoke(x, y, smokes);
}
