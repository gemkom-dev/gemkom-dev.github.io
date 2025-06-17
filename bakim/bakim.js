import { initNavbar } from '../components/navbar.js';
import { checkAuth } from '../auth.js';

// Check authentication before initializing the page
if (checkAuth()) {
    initNavbar();
}