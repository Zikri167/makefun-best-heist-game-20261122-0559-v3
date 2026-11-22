// Gilded Hour — the alarm meter: ratchet notches at 35% and 70% lock in
// forever; below the active notch it only decays while Moth is hidden and
// no guard is suspicious or chasing. 100% is lockdown.
import { CONFIG, clamp } from './config.js';

export function makeAlarm() {
  return { value: 0, ratchet: 0, lockdown: false, lastSpottedBy: null };
}

export function ratchetFloor(alarm) {
  return alarm.ratchet;
}

export function updateAlarm(alarm, dt, anyChase, anySuspicious, anyCameraSpot, hidden, getaway) {
  let v = alarm.value;
  if (anyChase) v += CONFIG.alarmChaseRate * dt;
  if (anyCameraSpot) v += CONFIG.alarmCameraRate * dt;
  if (getaway) v += CONFIG.alarmGetawayRate * dt;
  if (!anyChase && !anySuspicious && !anyCameraSpot && hidden) {
    v -= CONFIG.alarmDecayRate * dt;
  }
  v = clamp(v, 0, 100);
  for (const notch of CONFIG.alarmRatchets) {
    if (v >= notch && alarm.ratchet < notch) alarm.ratchet = notch;
  }
  if (v < alarm.ratchet) v = alarm.ratchet;
  alarm.value = v;
  alarm.lockdown = v >= 100;
  return alarm;
}
