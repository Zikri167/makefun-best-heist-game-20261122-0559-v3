// Gilded Hour — keyboard + mouse input, with one-shot consume flags.
export function makeInput(canvas) {
  const input = {
    up: false, down: false, left: false, right: false,
    sneak: false, action: false,
    consumeCoin: false, consumeSmoke: false,
    consumeEnter: false, consumeRetry: false, consumePause: false, consumeMute: false,
    coinX: 0, coinY: 0, mouseX: 0, mouseY: 0,
  };
  const keys = {};
  function key(e) { return e.key.toLowerCase(); }
  window.addEventListener('keydown', (e) => {
    const k = key(e);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (e.repeat) return;
    keys[k] = true;
    if (k === 'q') input.consumeCoin = true;
    if (k === 'f') input.consumeSmoke = true;
    if (k === 'enter') input.consumeEnter = true;
    if (k === 'r') input.consumeRetry = true;
    if (k === 'p') input.consumePause = true;
    if (k === 'm') input.consumeMute = true;
    sync();
  });
  window.addEventListener('keyup', (e) => { keys[key(e)] = false; sync(); });
  function sync() {
    input.up = !!(keys['w'] || keys['arrowup']);
    input.down = !!(keys['s'] || keys['arrowdown']);
    input.left = !!(keys['a'] || keys['arrowleft']);
    input.right = !!(keys['d'] || keys['arrowright']);
    input.sneak = !!keys['shift'];
    input.action = !!keys['e'];
  }
  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 1280,
      y: ((e.clientY - r.top) / r.height) * 720,
    };
  }
  canvas.addEventListener('mousemove', (e) => {
    const p = canvasPos(e);
    input.mouseX = p.x; input.mouseY = p.y;
  });
  canvas.addEventListener('mousedown', (e) => {
    const p = canvasPos(e);
    input.coinX = p.x; input.coinY = p.y;
    input.consumeCoin = true;
    input.consumeEnter = true;
  });
  input.endFrame = function () {
    input.consumeCoin = false;
    input.consumeSmoke = false;
    input.consumeEnter = false;
    input.consumeRetry = false;
    input.consumePause = false;
    input.consumeMute = false;
  };
  return input;
}
