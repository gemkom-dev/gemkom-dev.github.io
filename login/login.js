// login/login.js
import { isLoggedIn, isAdmin } from '../globalVariables.js';
import { setupLoginUI, populateUserSelect } from './loginView.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (isLoggedIn()) {
    window.location.href = isAdmin() ? '/admin' : '/machining';
    return;
  }

  await populateUserSelect();
  setupLoginUI();
});
