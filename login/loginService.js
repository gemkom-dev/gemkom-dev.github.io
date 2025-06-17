// login/loginService.js
import { backendBase } from '../base.js';

export async function fetchUsers() {
  const res = await fetch(`${backendBase}/user/list`);
  return await res.json();
}

export async function checkLogin(user_id, password) {
  const res = await fetch(`${backendBase}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, password })
  });
  return res.ok ? await res.json() : null;
}

export function saveLogin(userId, isAdmin) {
  localStorage.setItem('userId', userId);
  localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
}

export function logout() {
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login';
}
