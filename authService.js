import { backendBase } from './base.js';

const API_URL = backendBase;

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

async function getUser() {
    const user_data = await authedFetch(`${backendBase}/users/me/`);
    return await user_data.json();
}

function setTokens(newAccessToken, newRefreshToken) {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    localStorage.setItem('accessToken', newAccessToken);
    if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
    }
}

function clearTokens() {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

export async function login(username, password) {
    const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    setTokens(data.access, data.refresh);
    const user_data = await getUser();
    console.log(user_data);
    localStorage.setItem('user', JSON.stringify(user_data));
    return data;
}

export function logout() {
    clearTokens();
    window.location.href = '/login/';
}

export function isLoggedIn() {
    return !!localStorage.getItem('refreshToken');
}

export function mustResetPassword() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        return user.must_reset_password;
    } else {
        return false;
    }
}

export function isAdmin() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {      
        return user?.is_superuser || user?.is_admin;
    } else {
        return false;
    }
}

async function refreshAccessToken() {
    if (!refreshToken) {
        logout();
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${API_URL}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
           throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        setTokens(data.access, refreshToken); // Keep the same refresh token
        return accessToken;
    } catch(e) {
        logout();
        throw e;
    }
}

export async function authedFetch(url, options = {}) {
    if (!accessToken) {
       logout();
       throw new Error('Not authenticated');
    }

    options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
        await refreshAccessToken();
        options.headers['Authorization'] = `Bearer ${accessToken}`;
        response = await fetch(url, options); // Retry the request with the new token
    }

    return response;
}

export async function fetchUsers() {
    try {
        // This endpoint is assumed to be public for the login page user list.
        const response = await fetch(`${API_URL}/users/`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}

export function enforceAuth() {
    if (mustResetPassword()) {
        window.location.href = '/reset-password/';
        return false;
    } else if (!isLoggedIn()) {
        window.location.href = '/login/';
        return false;
    }
    document.body.classList.remove('pre-auth');
    return true;
}