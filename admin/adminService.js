import { backendBase } from '../base.js';
import { getSyncedNow } from '../timeService.js'
export async function fetchUsers() {
  const res = await fetch(`${backendBase}/user/list`);
  return await res.json();
}

export async function fetchActiveTimers() {
  const res = await fetch(`${backendBase}/active`);
  return await res.json();
}

export function formatDuration(startTime) {
  const elapsed = Math.floor((getSyncedNow() - startTime) / 1000);
  const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
  const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}
