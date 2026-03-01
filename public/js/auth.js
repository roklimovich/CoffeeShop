// Authentication management
let currentUser = null;

const auth = {
    async init() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const data = await api.getCurrentUser();
                currentUser = data.user;
                this.updateUI();
            } catch (error) {
                console.error('Failed to get current user:', error);
                this.logout();
            }
        } else {
            this.updateUI();
        }
    },

    getUser() {
        return currentUser;
    },

    isAuthenticated() {
        return currentUser !== null;
    },

    hasRole(...roles) {
        return currentUser && roles.includes(currentUser.role);
    },

    async login(email, password) {
        try {
            const data = await api.login(email, password);
            currentUser = data.user;
            this.updateUI();
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async register(userData) {
        try {
            const data = await api.register(userData);
            currentUser = data.user;
            api.setToken(data.token);
            this.updateUI();
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    logout() {
        currentUser = null;
        api.setToken(null);
        this.updateUI();
        window.location.hash = '#/';
    },

    updateUI() {
        const authRequired = document.querySelectorAll('.auth-required');
        const guestOnly = document.querySelectorAll('.guest-only');
        const userInfo = document.getElementById('userInfo');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.isAuthenticated()) {
            authRequired.forEach(el => {
                if (el.tagName === 'LI') {
                    el.style.display = '';
                } else {
                    el.style.display = '';
                }
            });
            guestOnly.forEach(el => {
                if (el.tagName === 'LI') {
                    el.style.display = 'none';
                } else {
                    el.style.display = 'none';
                }
            });
            
            if (userInfo) {
                userInfo.textContent = `${currentUser.name} (${currentUser.role})`;
                if (userInfo.parentElement.tagName === 'LI') {
                    userInfo.parentElement.style.display = '';
                } else {
                    userInfo.style.display = 'inline-block';
                }
            }
            
            if (logoutBtn) {
                if (logoutBtn.parentElement.tagName === 'LI') {
                    logoutBtn.parentElement.style.display = '';
                } else {
                    logoutBtn.style.display = 'inline-block';
                }
            }
        } else {
            authRequired.forEach(el => {
                if (el.tagName === 'LI') {
                    el.style.display = 'none';
                } else {
                    el.style.display = 'none';
                }
            });
            guestOnly.forEach(el => {
                if (el.tagName === 'LI') {
                    el.style.display = '';
                } else {
                    el.style.display = '';
                }
            });
            
            if (userInfo) {
                if (userInfo.parentElement.tagName === 'LI') {
                    userInfo.parentElement.style.display = 'none';
                } else {
                    userInfo.style.display = 'none';
                }
            }
            
            if (logoutBtn) {
                if (logoutBtn.parentElement.tagName === 'LI') {
                    logoutBtn.parentElement.style.display = 'none';
                } else {
                    logoutBtn.style.display = 'none';
                }
            }
        }
    }
};

// Initialize auth on load
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => auth.logout());
    }
});

