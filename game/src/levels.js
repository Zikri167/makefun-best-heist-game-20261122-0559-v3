// Gilded Hour — the three wings of the Meridian Museum.
// Coordinates are in the 1280x720 canvas; the HUD occupies the top 84 px,
// the arena runs from y=96 to y=708 and x=36 to x=1244.
const ARENA = { x: 36, y: 96, w: 1208, h: 612 };

function wing(o) { return { arena: ARENA, ...o }; }

export const LEVELS = [
  wing({
    id: 1,
    name: 'The Gallery',
    sub: 'Wing 1 of 3 — steal the Star Sapphire',
    start: { x: 90, y: 620 },
    exit: { x: 1150, y: 96, w: 58, h: 26 },
    walls: [
      { x: 420, y: 96, w: 16, h: 220 },
      { x: 420, y: 430, w: 16, h: 278 },
      { x: 820, y: 96, w: 16, h: 180 },
      { x: 820, y: 390, w: 16, h: 318 },
      { x: 640, y: 470, w: 180, h: 16 },
    ],
    cases: [
      { x: 560, y: 180, w: 110, h: 60 },
      { x: 950, y: 520, w: 110, h: 60 },
    ],
    curtains: [
      { x: 180, y: 96, w: 90, h: 34 },
      { x: 640, y: 674, w: 110, h: 34 },
      { x: 1010, y: 96, w: 90, h: 34 },
    ],
    vents: [
      { x: 90, y: 380, w: 190, h: 40 },
    ],
    loot: [
      { id: 'sapphire', name: 'Star Sapphire', value: 5000, x: 620, y: 240 },
      { id: 'coin-purse', name: 'Gold Coin Purse', value: 1200, x: 1080, y: 600 },
    ],
    cameras: [
      { id: 'cam-a', x: 640, y: 110, base: Math.PI / 2, range: 265, arc: 55, speed: 0.55,
        terminal: { x: 470, y: 150 } },
    ],
    guards: [
      { id: 'guard-1', name: 'Guard Mara', x: 560, y: 560,
        waypoints: [[560, 560], [560, 180], [760, 180], [760, 560]] },
      { id: 'guard-2', name: 'Guard Piet', x: 1000, y: 200,
        waypoints: [[1000, 200], [1000, 620], [1150, 620], [1150, 200]] },
    ],
  }),
  wing({
    id: 2,
    name: 'The Vault Hall',
    sub: 'Wing 2 of 3 — lift the paintings and the Ming vase',
    start: { x: 90, y: 620 },
    exit: { x: 1150, y: 96, w: 58, h: 26 },
    vaultDoor: { x: 900, y: 330, w: 16, h: 110, locked: true },
    walls: [
      { x: 420, y: 96, w: 16, h: 240 },
      { x: 420, y: 450, w: 16, h: 258 },
      { x: 900, y: 96, w: 16, h: 234 },
      { x: 900, y: 440, w: 16, h: 268 },
      { x: 640, y: 560, w: 260, h: 16 },
    ],
    cases: [
      { x: 560, y: 150, w: 120, h: 64 },
      { x: 1020, y: 560, w: 120, h: 64 },
    ],
    curtains: [
      { x: 200, y: 96, w: 100, h: 34 },
      { x: 700, y: 674, w: 110, h: 34 },
      { x: 1060, y: 300, w: 34, h: 110 },
    ],
    vents: [
      { x: 90, y: 330, w: 200, h: 40 },
      { x: 960, y: 150, w: 180, h: 40 },
    ],
    loot: [
      { id: 'portrait', name: 'Portrait of the Duchess', value: 4200, x: 300, y: 200 },
      { id: 'landscape', name: 'Golden Landscape', value: 3800, x: 700, y: 640 },
      { id: 'vase', name: 'Ming Vase', value: 6500, x: 1090, y: 300 },
    ],
    cameras: [
      { id: 'cam-b', x: 660, y: 110, base: Math.PI / 2, range: 265, arc: 55, speed: 0.6,
        terminal: { x: 470, y: 160 } },
      { id: 'cam-c', x: 1080, y: 700, base: -Math.PI / 2, range: 265, arc: 55, speed: 0.5,
        terminal: { x: 1160, y: 560 } },
    ],
    guards: [
      { id: 'guard-3', name: 'Guard Mara', x: 300, y: 500,
        waypoints: [[300, 500], [300, 180], [560, 180], [560, 500]] },
      { id: 'guard-4', name: 'Guard Piet', x: 760, y: 200,
        waypoints: [[760, 200], [760, 640], [980, 640], [980, 200]] },
      { id: 'guard-5', name: 'Guard Sable', x: 1100, y: 480,
        waypoints: [[1100, 480], [1100, 180], [1000, 180], [1000, 480]] },
    ],
  }),
  wing({
    id: 3,
    name: 'The Crown Room',
    sub: 'Wing 3 of 3 — take the Velvet Crown and run',
    start: { x: 90, y: 620 },
    exit: { x: 1150, y: 96, w: 58, h: 26 },
    walls: [
      { x: 420, y: 96, w: 16, h: 200 },
      { x: 420, y: 410, w: 16, h: 298 },
      { x: 820, y: 96, w: 16, h: 200 },
      { x: 820, y: 410, w: 16, h: 298 },
      { x: 560, y: 330, w: 160, h: 16 },
    ],
    cases: [
      { x: 560, y: 150, w: 120, h: 64 },
      { x: 950, y: 560, w: 120, h: 64 },
      { x: 220, y: 420, w: 110, h: 60 },
    ],
    curtains: [
      { x: 180, y: 96, w: 100, h: 34 },
      { x: 640, y: 674, w: 110, h: 34 },
      { x: 1060, y: 96, w: 100, h: 34 },
      { x: 180, y: 674, w: 100, h: 34 },
    ],
    vents: [
      { x: 90, y: 300, w: 200, h: 40 },
      { x: 960, y: 330, w: 200, h: 40 },
    ],
    loot: [
      { id: 'crown', name: 'Velvet Crown', value: 12000, x: 640, y: 280 },
      { id: 'scepter', name: 'Golden Scepter', value: 6000, x: 1080, y: 600 },
      { id: 'emerald', name: 'Emerald Brooch', value: 4500, x: 240, y: 200 },
    ],
    cameras: [
      { id: 'cam-d', x: 640, y: 110, base: Math.PI / 2, range: 265, arc: 55, speed: 0.55,
        terminal: { x: 470, y: 150 } },
      { id: 'cam-e', x: 240, y: 700, base: -Math.PI / 2, range: 265, arc: 50, speed: 0.65,
        terminal: { x: 130, y: 560 } },
      { id: 'cam-f', x: 1080, y: 110, base: Math.PI / 2, range: 265, arc: 50, speed: 0.5,
        terminal: { x: 1180, y: 250 } },
    ],
    guards: [
      { id: 'guard-6', name: 'Guard Mara', x: 300, y: 300,
        waypoints: [[300, 300], [300, 600], [560, 600], [560, 300]] },
      { id: 'guard-7', name: 'Guard Piet', x: 940, y: 300,
        waypoints: [[940, 300], [940, 600], [700, 600], [700, 300]] },
      { id: 'guard-8', name: 'Guard Sable', x: 640, y: 480,
        waypoints: [[640, 480], [1090, 480], [1090, 200], [640, 200]] },
    ],
  }),
];

export function totalLootValue() {
  return LEVELS.reduce((s, l) => s + l.loot.reduce((a, b) => a + b.value, 0), 0);
}
export function totalLootCount() {
  return LEVELS.reduce((s, l) => s + l.loot.length, 0);
}
