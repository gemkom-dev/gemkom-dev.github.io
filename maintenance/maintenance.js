import { initNavbar } from '../components/navbar.js';
import { enforceAuth } from '../authService.js';
import { TimerWidget } from '../components/timerWidget.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!enforceAuth()) {
        return;
    }
    initNavbar();
    new TimerWidget();
});