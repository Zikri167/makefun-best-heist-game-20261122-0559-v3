// Gilded Hour — all sound is synthesized WebAudio: no audio files, no network.
export function makeAudio() {
  const a = { ctx: null, muted: false, ambient: null };
  a.ensure = function () {
    if (!a.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        a.ctx = new AC();
        a.startAmbient();
      } catch { a.ctx = null; }
    }
    if (a.ctx && a.ctx.state === 'suspended') a.ctx.resume();
    return a.ctx;
  };
  a.tone = function (freq, dur, type, gain, slideTo) {
    if (a.muted) return;
    const ctx = a.ensure(); if (!ctx) return;
    try {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
      g.gain.setValueAtTime(gain || 0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch { /* audio is garnish, never fatal */ }
  };
  a.step = function (sneak) { a.tone(sneak ? 130 : 190, 0.05, 'triangle', sneak ? 0.02 : 0.035); };
  a.coin = function () { a.tone(1250, 0.09, 'sine', 0.07, 1900); };
  a.loot = function () { a.tone(660, 0.12, 'sine', 0.09); setTimeout(() => a.tone(990, 0.18, 'sine', 0.09), 90); };
  a.question = function () { a.tone(520, 0.12, 'square', 0.045, 780); };
  a.alarmBlip = function () { a.tone(880, 0.08, 'square', 0.04, 660); };
  a.caught = function () {
    a.tone(220, 0.5, 'sawtooth', 0.1, 55);
    setTimeout(() => a.tone(165, 0.4, 'sawtooth', 0.08, 55), 120);
  };
  a.hackDone = function () { a.tone(440, 0.1, 'sine', 0.08); setTimeout(() => a.tone(880, 0.16, 'sine', 0.08), 100); };
  a.win = function () {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => a.tone(f, 0.22, 'sine', 0.09), i * 130));
  };
  a.toggleMute = function () { a.muted = !a.muted; return a.muted; };
  a.startAmbient = function () {
    try {
      const ctx = a.ctx; if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain(), o2 = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = 55;
      o2.type = 'sine'; o2.frequency.value = 55.7;
      g.gain.value = 0.018;
      o.connect(g); o2.connect(g); g.connect(ctx.destination);
      o.start(); o2.start();
      a.ambient = { o, o2, g };
    } catch { /* ignore */ }
  };
  return a;
}
