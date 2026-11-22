// Gilded Hour — security cameras: fixed pivot, sweeping red cone, hackable.
import { CONFIG } from './config.js';

export function makeCamera(def) {
  return {
    id: def.id, x: def.x, y: def.y, base: def.base,
    range: def.range || CONFIG.cameraRange,
    arc: ((def.arc ?? CONFIG.cameraSweepArcDeg) * Math.PI) / 180,
    speed: def.speed ?? CONFIG.cameraSweepSpeed,
    terminal: { x: def.terminal.x, y: def.terminal.y },
    angle: def.base, phase: Math.random() * 6,
    disabled: 0, spotted: false,
  };
}

// Sweep back and forth on a fixed pattern; tick down the disable timer.
export function updateCamera(cam, t, dt) {
  cam.angle = cam.base + Math.sin(t * cam.speed + cam.phase) * cam.arc;
  if (cam.disabled > 0) cam.disabled = Math.max(0, cam.disabled - dt);
  return cam;
}

export function disableCamera(cam) {
  cam.disabled = CONFIG.cameraDisabledSeconds;
  cam.spotted = false;
}
