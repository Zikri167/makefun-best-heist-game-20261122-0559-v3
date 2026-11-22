// Gilded Hour — guards: patrol, suspicion "?", investigation, chase "!".
import { CONFIG, angleDiff, clamp, dist } from './config.js';
import { moveCircle } from './world.js';
import { guardSeesPlayer } from './sight.js';

export function makeGuard(def) {
  return {
    id: def.id, name: def.name, x: def.x, y: def.y,
    waypoints: def.waypoints.map(([x, y]) => ({ x, y })),
    wpIndex: 0, facing: 0, state: 'patrol', // patrol | suspicious | investigate | chase
    suspicion: 0, speed: CONFIG.guardWalkSpeed,
    investigateTarget: null, lastSeen: null, loseTimer: 0,
    pauseTimer: 0, bobPhase: Math.random() * 6,
  };
}

function stepToward(g, tx, ty, speed, dt, solids) {
  const d = dist(g.x, g.y, tx, ty);
  if (d < 4) return true;
  const vx = ((tx - g.x) / d) * speed * dt;
  const vy = ((ty - g.y) / d) * speed * dt;
  const m = moveCircle(g.x, g.y, vx, vy, 14, solids);
  g.x = m.x; g.y = m.y;
  g.facing = Math.atan2(ty - g.y, tx - g.x);
  return d < 12;
}

export function updateGuard(g, player, level, dt, solids, alarm, events) {
  const seen = guardSeesPlayer(g, player, level, player.smokes);
  const prevState = g.state;
  if (seen.seen) {
    const gain = seen.dist < 110 ? CONFIG.suspicionGainClose : CONFIG.suspicionGain;
    g.suspicion = clamp(g.suspicion + gain * dt, 0, 100);
    g.lastSeen = { x: player.x, y: player.y };
    g.loseTimer = 0;
    if (g.suspicion >= 100 && g.state !== 'chase') {
      g.state = 'chase';
      events.push({ type: 'chase-start', guard: g });
    } else if (g.suspicion >= 25 && g.state === 'patrol') {
      g.state = 'suspicious';
      events.push({ type: 'suspicion', guard: g });
    }
  } else {
    g.suspicion = clamp(g.suspicion - CONFIG.suspicionDecay * dt, 0, 100);
    if (g.state === 'chase') {
      g.loseTimer += dt;
      if (g.loseTimer > CONFIG.chaseLoseSeconds) {
        g.state = 'investigate';
        g.investigateTarget = g.lastSeen ? { ...g.lastSeen } : { x: g.x, y: g.y };
      }
    } else if (g.state === 'suspicious' && g.suspicion <= 0) {
      g.state = 'patrol';
    }
  }

  // Coin lure: a landed coin nearby pulls a patrolling guard to investigate.
  if (g.state === 'patrol' || g.state === 'suspicious') {
    for (const c of player.coinsThrown) {
      if (c.landed && dist(g.x, g.y, c.x, c.y) < CONFIG.coinLureRadius) {
        g.state = 'investigate';
        g.investigateTarget = { x: c.x, y: c.y };
        g.suspicion = Math.max(g.suspicion, 40);
        events.push({ type: 'coin-lure', guard: g });
        break;
      }
    }
  }

  switch (g.state) {
    case 'patrol': {
      const wp = g.waypoints[g.wpIndex];
      if (g.pauseTimer > 0) { g.pauseTimer -= dt; break; }
      if (stepToward(g, wp.x, wp.y, CONFIG.guardWalkSpeed, dt, solids)) {
        g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
        g.pauseTimer = 0.7;
      }
      break;
    }
    case 'suspicious': {
      // Freeze and turn toward the disturbance, then go look.
      if (g.lastSeen) g.facing = Math.atan2(g.lastSeen.y - g.y, g.lastSeen.x - g.x);
      g.pauseTimer -= dt;
      if (g.pauseTimer <= 0 && g.suspicion > 0 && !seen.seen) {
        g.state = 'investigate';
        g.investigateTarget = g.lastSeen ? { ...g.lastSeen } : { x: g.x, y: g.y };
      }
      break;
    }
    case 'investigate': {
      const t = g.investigateTarget || { x: g.x, y: g.y };
      if (stepToward(g, t.x, t.y, CONFIG.guardInvestigateSpeed, dt, solids)) {
        g.pauseTimer = 1.2;
        g.state = 'patrol';
        g.suspicion = 0;
      }
      break;
    }
    case 'chase': {
      const target = seen.seen ? { x: player.x, y: player.y } : (g.lastSeen || { x: g.x, y: g.y });
      stepToward(g, target.x, target.y, CONFIG.guardChaseSpeed, dt, solids);
      break;
    }
  }
  if (g.state === 'suspicious' && prevState === 'patrol') g.pauseTimer = 0.9;
  g.bobPhase += dt * 6;
  return g;
}

export function guardCaughtPlayer(g, player) {
  return g.state === 'chase' && dist(g.x, g.y, player.x, player.y) < CONFIG.guardCatchRadius;
}
