// Auth components
function renderLoginPage() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <main class="content auth-container">
            <div class="auth-box glass">
                <h2>${i18n.t('auth.login')}</h2>
                <p class="auth-subtitle">${i18n.t('auth.noAccount')} <a href="#/register">${i18n.t('auth.register')}</a></p>
                <form id="loginForm" class="auth-form" onsubmit="handleLogin(event)">
                    <label>${i18n.t('auth.email')} *</label>
                    <input type="email" name="email" required placeholder="yourname@mail.com">
                    <span class="error" id="emailError"></span>
                    <label>${i18n.t('auth.password')} *</label>
                    <input type="password" name="password" required placeholder="••••••">
                    <span class="error" id="passwordError"></span>
                    <button type="submit" class="auth-btn">${i18n.t('auth.login')}</button>
                </form>
                <div id="loginAlert"></div>
            </div>
        </main>
    `;
}

function renderRegisterPage() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <main class="content auth-container">
            <div class="auth-box glass">
                <h2>${i18n.t('auth.register')}</h2>
                <p class="auth-subtitle">${i18n.t('auth.haveAccount')} <a href="#/login">${i18n.t('auth.login')}</a></p>
                <form id="registerForm" class="auth-form" onsubmit="handleRegister(event)">
                    <label>${i18n.t('auth.name')} *</label>
                    <input type="text" name="name" required minlength="2" placeholder="Your name">
                    <span class="error" id="nameError"></span>
                    <label>${i18n.t('auth.email')} *</label>
                    <input type="email" name="email" required placeholder="yourname@mail.com">
                    <span class="error" id="emailError"></span>
                    <label>${i18n.t('auth.password')} *</label>
                    <input type="password" name="password" required minlength="6" placeholder="••••••">
                    <span class="error" id="passwordError"></span>
                    <button type="submit" class="auth-btn">${i18n.t('auth.register')}</button>
                </form>
                <div id="registerAlert"></div>
            </div>
        </main>
    `;
}

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Client-side validation
    if (!email || !password) {
        showAlert('error', i18n.t('common.required'), 'loginAlert');
        return;
    }
    
    if (!isValidEmail(email)) {
        document.getElementById('emailError').textContent = i18n.t('common.invalidEmail');
        return;
    }
    
    showLoading();
    
    try {
        const result = await auth.login(email, password);
        if (result.success) {
            showAlert('success', i18n.t('auth.loginSuccess'), 'loginAlert');
            setTimeout(() => {
                router.navigate('#/');
            }, 1000);
        } else {
            showAlert('error', result.error || i18n.t('auth.invalidCredentials'), 'loginAlert');
        }
    } catch (error) {
        showAlert('error', error.message, 'loginAlert');
    } finally {
        hideLoading();
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Client-side validation
    if (!name || name.length < 2) {
        document.getElementById('nameError').textContent = i18n.t('common.minLength', { min: 2 });
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        document.getElementById('emailError').textContent = i18n.t('common.invalidEmail');
        return;
    }
    
    if (!password || password.length < 6) {
        document.getElementById('passwordError').textContent = i18n.t('common.minLength', { min: 6 });
        return;
    }
    
    showLoading();
    
    try {
        const result = await auth.register({ name, email, password });
        if (result.success) {
            showAlert('success', i18n.t('auth.registerSuccess'), 'registerAlert');
            setTimeout(() => {
                router.navigate('#/');
            }, 1000);
        } else {
            showAlert('error', result.error, 'registerAlert');
        }
    } catch (error) {
        showAlert('error', error.message, 'registerAlert');
    } finally {
        hideLoading();
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Update UI on language change
window.addEventListener('langchange', () => {
    if (router.currentRoute === '/login') {
        renderLoginPage();
    } else if (router.currentRoute === '/register') {
        renderRegisterPage();
    }
});

