// Gilded Hour — vision cones and detection for guards and cameras.
import { CONFIG, angleDiff, dist } from './config.js';
import { hasLineOfSight, hiddenNow } from './world.js';

// Is the target inside a vision cone (range, half-angle, facing) with a clear
// line of sight? Returns { seen, dist, angleOff }.
export function coneSees(ox, oy, facing, range, halfAngle, tx, ty, level, smokes) {
  const d = dist(ox, oy, tx, ty);
  if (d > range) return { seen: false, dist: d, angleOff: 0 };
  const off = Math.abs(angleDiff(Math.atan2(ty - oy, tx - ox), facing));
  if (off > halfAngle) return { seen: false, dist: d, angleOff: off };
  if (insideSmokeBlock(ox, oy, tx, ty, smokes)) return { seen: false, dist: d, angleOff: off };
  if (!hasLineOfSight(ox, oy, tx, ty, level)) return { seen: false, dist: d, angleOff: off };
  return { seen: true, dist: d, angleOff: off };
}

function insideSmokeBlock(x1, y1, x2, y2, smokes) {
  // A smoke cloud between watcher and target breaks the sight line.
  for (const s of smokes) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    if (Math.hypot(mx - s.x, my - s.y) < s.radius) return true;
    if (Math.hypot(x2 - s.x, y2 - s.y) < s.radius) return true;
  }
  return false;
}

// Guard vision, honouring sneak (shorter range), curtains and vents:
// hidden Moth is invisible unless the guard is almost on top of them.
export function guardSeesPlayer(guard, player, level, smokes) {
  const range = player.sneaking ? CONFIG.guardSightRangeSneak : CONFIG.guardSightRange;
  const hidden = hiddenNow(player.x, player.y, level, smokes);
  const d = dist(guard.x, guard.y, player.x, player.y);
  if (hidden && d > CONFIG.guardCloseSeeRadius) return { seen: false, dist: d };
  return coneSees(guard.x, guard.y, guard.facing, range,
    (CONFIG.guardHalfAngleDeg * Math.PI) / 180, player.x, player.y, level, smokes);
}

export function cameraSeesPlayer(camera, player, level, smokes) {
  if (camera.disabled > 0) return { seen: false, dist: 0 };
  const hidden = hiddenNow(player.x, player.y, level, smokes);
  const d = dist(camera.x, camera.y, player.x, player.y);
  if (hidden && d > CONFIG.guardCloseSeeRadius) return { seen: false, dist: d };
  return coneSees(camera.x, camera.y, camera.angle, camera.range,
    (CONFIG.cameraHalfAngleDeg * Math.PI) / 180, player.x, player.y, level, smokes);
}

// A point is inside any camera's live cone right now (used to place terminals
// in blind spots and to warn the player).
export function pointInLiveCameraCone(x, y, cameras, level) {
  for (const c of cameras) {
    if (c.disabled > 0) continue;
    const r = coneSees(c.x, c.y, c.angle, c.range,
      (CONFIG.cameraHalfAngleDeg * Math.PI) / 180, x, y, level, []);
    if (r.seen) return c;
  }
  return null;
}
