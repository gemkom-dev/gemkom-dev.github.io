import { isLoggedIn, isAdmin } from './globalVariables.js';

// List of public routes that don't require authentication
const publicRoutes = ['/login'];
const adminRoutes = ['/admin'];

// Function to check if the current route is public
function isPublicRoute(path) {
    return publicRoutes.includes(path);
}

function isAdminRoute(path) {
    return adminRoutes.includes(path);
}

// Function to handle authentication check
export function checkAuth() {
    const currentPath = window.location.pathname;
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        // Redirect to login page
        window.location.href = '/login';
        return false;
    }

    if (isAdminRoute(currentPath) && !isAdmin()){
        // Redirect to login page
        window.location.href = '/login';
        return false;
    }

    return true;
}

// Initialize auth check when the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
}); 