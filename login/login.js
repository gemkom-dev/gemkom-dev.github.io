// login/login.js
import { login, fetchUsers, mustResetPassword, isLoggedIn } from '../authService.js';

function populateUserSelect(users) {
    const userSelect = document.getElementById('user-select');
    if (!userSelect) return;

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.username;
        option.textContent = user.first_name ? `${user.first_name} ${user.last_name}` : user.username;
        userSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // If already logged in, redirect to the main page
    if (isLoggedIn() && !mustResetPassword()) {
        window.location.href = '/';
        return;
    } else if (mustResetPassword()) {
        window.location.href = '/login/reset-password';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const userSelect = document.getElementById('user-select');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    // Fetch and populate users
    try {
        const users = await fetchUsers();
        populateUserSelect(users);
    } catch (error) {
        errorMessage.textContent = 'Kullanıcılar yüklenemedi.';
        errorMessage.style.display = 'block';
    }

    // Handle user selection
    userSelect.addEventListener('change', () => {
        usernameInput.value = userSelect.value;
    });

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username) {
            errorMessage.textContent = 'Lütfen bir kullanıcı seçin.';
            errorMessage.style.display = 'block';
            return;
        }
        
        loginButton.disabled = true;
        loginButton.textContent = 'Giriş Yapılıyor...';
        errorMessage.style.display = 'none';

        try {
            await login(username, password);
            const user = JSON.parse(localStorage.getItem('user'));
            if (user.must_reset_password){
                window.location.href = '/login/reset-password';
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            errorMessage.textContent = 'Kullanıcı adı veya şifre hatalı.';
            errorMessage.style.display = 'block';
            loginButton.disabled = false;
            loginButton.textContent = 'Giriş Yap';
        }
    });
});
