import { SPAWN, WORLD_LIMIT, WALK_SPEED } from './exhibits.mjs';
export const EYE_HEIGHT = 1.7;
export const PLAYER_RADIUS = 0.28;

export function isWalkable(x, z, colliders) {
  if (!Number.isFinite(x) || !Number.isFinite(z) || Math.abs(x) > WORLD_LIMIT || Math.abs(z) > WORLD_LIMIT) return false;
  return !colliders.some(b => x > b.minX - PLAYER_RADIUS && x < b.maxX + PLAYER_RADIUS && z > b.minZ - PLAYER_RADIUS && z < b.maxZ + PLAYER_RADIUS && b.minY < EYE_HEIGHT && b.maxY > 0.1);
}

// Small substeps prevent tunneling. Each axis resolves separately to slide along walls.
export function movePlayer(position, forward, right, yaw, dt, colliders) {
  const magnitude = Math.hypot(forward, right);
  if (!magnitude) return;
  const distance = WALK_SPEED * Math.max(0, Math.min(dt, 0.05));
  const dx = (right * Math.cos(yaw) - forward * Math.sin(yaw)) / magnitude * distance;
  const dz = (-right * Math.sin(yaw) - forward * Math.cos(yaw)) / magnitude * distance;
  const steps = Math.max(1, Math.ceil(distance / 0.08));
  for (let i = 0; i < steps; i++) {
    if (isWalkable(position.x + dx / steps, position.z, colliders)) position.x += dx / steps;
    if (isWalkable(position.x, position.z + dz / steps, colliders)) position.z += dz / steps;
  }
}

export function createPlayer(camera, canvas, colliders, callbacks) {
  const events = new AbortController();
  const keys = new Set();
  let yaw = 0, pitch = 0, active = false;
  const listen = (target, name, fn) => target.addEventListener(name, fn, { signal: events.signal });
  function clear() { keys.clear(); }
  function unlock() {
    active = false;
    clear();
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }
  function teleport(point = SPAWN) {
    clear();
    if (!isWalkable(point.x, point.z, colliders)) point = SPAWN;
    camera.position.set(point.x, EYE_HEIGHT, point.z);
    yaw = point.yaw || 0; pitch = 0;
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }
  listen(document, 'pointerlockchange', () => {
    active = document.pointerLockElement === canvas;
    clear();
    callbacks.lock(active);
  });
  listen(document, 'pointerlockerror', () => { unlock(); callbacks.denied(); });
  listen(window, 'blur', () => { unlock(); callbacks.pause(); });
  listen(document, 'mousemove', e => {
    if (!active) return;
    yaw -= e.movementX * 0.002;
    pitch = Math.max(-1.35, Math.min(1.35, pitch - e.movementY * 0.002));
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  });
  listen(document, 'keydown', e => {
    if (!active || e.ctrlKey || e.metaKey || e.altKey) return;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'Escape'].includes(e.code)) e.preventDefault();
    if (e.code === 'Escape') { unlock(); callbacks.pause(); }
    else if (e.code === 'KeyE' && !e.repeat) callbacks.interact();
    else keys.add(e.code);
  });
  listen(document, 'keyup', e => keys.delete(e.code));
  listen(canvas, 'click', () => { if (active) callbacks.interact(); });
  teleport();
  return {
    teleport, unlock,
    requestControl() {
      if (!canvas.requestPointerLock) { callbacks.denied(); return; }
      // Must run synchronously from the Start/Resume click, never after loading.
      try { canvas.requestPointerLock()?.catch(() => callbacks.denied()); }
      catch { callbacks.denied(); }
    },
    update(dt) {
      if (!active) return;
      if (!isWalkable(camera.position.x, camera.position.z, colliders)) teleport();
      movePlayer(camera.position, Number(keys.has('KeyW')) - Number(keys.has('KeyS')), Number(keys.has('KeyD')) - Number(keys.has('KeyA')), yaw, dt, colliders);
      camera.position.y = EYE_HEIGHT;
    },
    dispose() { unlock(); events.abort(); }
  };
}
