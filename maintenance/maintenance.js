import { initNavbar } from '../components/navbar.js';
import { isLoggedIn, logout } from '../authService.js';

document.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        initNavbar();
    } else {
        logout();
    }
});