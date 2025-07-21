import { backendBase } from './base.js';
import { extractResultsFromResponse } from './generic/paginationHelper.js';

const API_URL = backendBase;

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

// Centralized routing to prevent infinite redirects
export const ROUTES = {
    LOGIN: '/login/',
    RESET_PASSWORD: '/login/reset-password/',
    HOME: '/',
    ADMIN: '/admin/',
    MACHINING: '/machining/',
    MACHINING_TASKS: '/machining/tasks/',
    MAINTENANCE: '/maintenance/'
};

// Track if we're currently redirecting to prevent loops
let isRedirecting = false;

export async function getUser() {
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
    localStorage.setItem('user', JSON.stringify(user_data));
    return data;
}

export function logout() {
    clearTokens();
    navigateTo(ROUTES.LOGIN);
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

export function isLead() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) { 
        return user?.is_lead;
    } else {
        return false;
    }
}

// Enhanced navigation with optional soft reload
export function navigateTo(path, options = {}) {
    if (isRedirecting) return; // Prevent multiple simultaneous redirects
    
    isRedirecting = true;
    window.location.href = path;
    
    // Reset redirecting flag after a short delay
    setTimeout(() => {
        isRedirecting = false;
    }, 100);
}

export function navigateByTeam() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (isAdmin() || user.team === null){
        navigateTo(ROUTES.HOME);
        return;
    }
    if (user.team === 'machining') {
        navigateTo(ROUTES.MACHINING);
    } else if (user.team === 'maintenance') {
        navigateTo(ROUTES.MAINTENANCE);
    }
}

// Route guard functions
export function shouldBeOnLoginPage() {
    return !isLoggedIn();
}

export function shouldBeOnResetPasswordPage() {
    return isLoggedIn() && mustResetPassword();
}

export function shouldBeOnMainPage() {
    return isLoggedIn() && !mustResetPassword();
}

// Route guard utility for pages
export function guardRoute() {
    const currentPath = window.location.pathname;
    
    // If we're already redirecting, don't do anything
    if (isRedirecting) {
        return false;
    }
    
    // If not logged in, should be on login page
    if (!isLoggedIn()) {
        if (currentPath !== ROUTES.LOGIN) {
            navigateTo(ROUTES.LOGIN);
            return false;
        }
        return true;
    }
    
    // If logged in but must reset password, should be on reset password page
    if (mustResetPassword()) {
        if (currentPath !== ROUTES.RESET_PASSWORD) {
            navigateTo(ROUTES.RESET_PASSWORD);
            return false;
        }
        return true;
    }
    
    // If logged in and doesn't need password reset, should be on main page
    // (not on login or reset password pages)
    if (currentPath === ROUTES.LOGIN || currentPath === ROUTES.RESET_PASSWORD) {
        navigateTo(ROUTES.HOME);
        return false;
    }
    
    // If we get here, user is authenticated and on the right page
    document.body.classList.remove('pre-auth');
    return true;
}

// Enhanced enforceAuth with better logic
export function enforceAuth() {
    return guardRoute();
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
