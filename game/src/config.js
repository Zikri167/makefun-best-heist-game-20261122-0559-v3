// Gilded Hour — tuning constants and shared palette.
// One place for every number the playtest may need to move.
export const CONFIG = {
  viewW: 1280,
  viewH: 720,
  hudH: 84,
  wallT: 14,
  playerRadius: 13,
  walkSpeed: 165,
  sneakSpeed: 92,
  ventSpeed: 70,
  guardWalkSpeed: 78,
  guardChaseSpeed: 168,
  guardInvestigateSpeed: 110,
  guardSightRange: 235,
  guardSightRangeSneak: 150,
  guardHalfAngleDeg: 37.5,
  guardCatchRadius: 26,
  guardCloseSeeRadius: 42,
  cameraRange: 265,
  cameraHalfAngleDeg: 30,
  cameraSweepArcDeg: 55,
  cameraSweepSpeed: 0.55,
  cameraDisabledSeconds: 20,
  hackSeconds: 2.5,
  lootChannelSeconds: 1.0,
  alarmRatchets: [35, 70],
  alarmChaseRate: 9,
  alarmCameraRate: 12,
  alarmGetawayRate: 2.2,
  alarmDecayRate: 3.5,
  suspicionGain: 95,
  suspicionGainClose: 160,
  suspicionDecay: 26,
  chaseLoseSeconds: 3.0,
  smokeSeconds: 4,
  smokeRadius: 95,
  coinCount: 6,
  pelletCount: 2,
  coinLureRadius: 320,
  coinThrowSpeed: 520,
};

export const PALETTE = {
  wall: '#1b2740',
  wallEdge: '#3d5a80',
  floorA: '#2a2118',
  floorB: '#241d15',
  carpet: '#7a1f2b',
  carpetEdge: '#a83240',
  gold: '#e8b64c',
  goldBright: '#ffd97a',
  marble: '#e9e4d8',
  curtain: '#8e1f2f',
  curtainDark: '#5d1220',
  curtainHi: '#c33a4e',
  guardCone: 'rgba(232, 182, 76, 0.20)',
  guardConeEdge: 'rgba(232, 182, 76, 0.55)',
  cameraCone: 'rgba(224, 49, 49, 0.20)',
  cameraConeEdge: 'rgba(224, 49, 49, 0.6)',
  exitGreen: '#2fbf71',
  hudBg: '#101623',
  text: '#f2ead8',
  muted: '#9aa5b8',
};

export function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
export function dist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); }
export function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
export function lerp(a, b, t) { return a + (b - a) * t; }
// Deterministic PRNG (mulberry32) so screenshot scenes are stable per seed.
export function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
