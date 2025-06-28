import { initNavbar } from '../components/navbar.js';
import { guardRoute } from '../authService.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!guardRoute()) {
        return;
    }
    initNavbar();
});