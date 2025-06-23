import { initNavbar } from '../components/navbar.js';
import { isLoggedIn, logout } from '../authService.js';
import { TimerWidget } from '../components/timerWidget.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        logout();
        return;
    }
    
    initNavbar();
    new TimerWidget();
});