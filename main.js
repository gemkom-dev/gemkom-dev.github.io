import { isLoggedIn, logout } from './authService.js';
import { initNavbar } from './components/navbar.js';
import { TimerWidget } from './components/timerWidget.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (isLoggedIn()) {
        initNavbar();
        new TimerWidget();

    } else {
        // If not on the login page, redirect to login
        if (window.location.pathname !== '/login/' && !window.location.pathname.endsWith('index.html')) {
            logout();
        }
    }
});