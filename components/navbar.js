import { isLoggedIn } from "../globalVariables.js"

// Navbar component
export function createNavbar() {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar navbar-expand-lg navbar-dark bg-dark';
    navbar.innerHTML = `
        <div class="container">
            <a class="navbar-brand" href="/">GEMKOM</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="/">Ana Sayfa</a>
                    </li>
                    <li class="nav-item admin-only" style="display: none;">
                        <a class="nav-link" href="/admin">Admin</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/maintenance">Bakım</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/machining">Talaşlı İmalat</a>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <button id="logout-button" class="nav-link">Çıkış</button>
                    </li>
                </ul>
            </div>
        </div>
    `;

    // Add active class to current page link
    const currentPath = window.location.pathname;
    const navLinks = navbar.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Add click handlers for navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Allow home page and login page without authentication
            if (link.getAttribute('href') === '/' || link.getAttribute('href') === '/login') {
                return;
            }

            // Check if user is logged in
            if (!isLoggedIn()) {
                e.preventDefault();
                window.location.href = '/login';
            }
        });
    });

    // Show admin tab if user is admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const adminTab = navbar.querySelector('.admin-only');
    if (isAdmin) {
        adminTab.style.display = 'block';
    }

    return navbar;
}

// Function to initialize navbar
export function initNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        const navbar = createNavbar();
        navbarContainer.appendChild(navbar);
        setupLogoutButton();
    }
}

export function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.onclick = () => {
            localStorage.clear();
            window.location.href = '/login';
        };
    }
}