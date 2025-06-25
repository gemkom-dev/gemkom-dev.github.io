import { enforceAuth } from './authService.js';
import { initNavbar } from './components/navbar.js';
import { TimerWidget } from './components/timerWidget.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (!enforceAuth()) {
        return;
    }
    initNavbar();
    new TimerWidget();
});