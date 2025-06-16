import { backendBase } from './base';

export interface User {
  id: string;
  name: string;
  is_admin?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${backendBase}/user/list`);
  return await res.json();
}

export async function checkLogin(user_id: string, password: string): Promise<LoginResponse | null> {
  const res = await fetch(`${backendBase}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, password })
  });
  return res.ok ? await res.json() : null;
}

export function saveLogin(userId: string, isAdmin: boolean): void {
  localStorage.setItem('user-id', userId);
  localStorage.setItem('is-admin', isAdmin ? 'true' : 'false');
}

export function isLoggedIn(): boolean {
  return localStorage.getItem('user-id') !== null;
}

export function isAdmin(): boolean {
  return localStorage.getItem('is-admin') === 'true';
}

export function logout(): void {
  localStorage.removeItem('user-id');
  localStorage.removeItem('is-admin');
  localStorage.removeItem('jira-timer-state');
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem('user-id');
}