// Simple SPA router
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    route(path, handler) {
        this.routes[path] = handler;
    }

    handleRoute() {
        let hash = window.location.hash.slice(1);
        // Redirect root to /home
        if (hash === '' || hash === '/') {
            hash = '/home';
            window.location.hash = '#/home';
            return;
        }
        const path = hash.split('?')[0];
        
        // Try exact match first
        let handler = this.routes[path];
        
        // Try pattern matching for dynamic routes
        if (!handler) {
            for (const route in this.routes) {
                const pattern = route.replace(/:[^/]+/g, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                if (regex.test(path)) {
                    handler = this.routes[route];
                    break;
                }
            }
        }
        
        if (handler) {
            // Check auth requirements
            if (handler.auth && !auth.isAuthenticated()) {
                window.location.hash = '#/login';
                return;
            }
            
            if (handler.roles && !auth.hasRole(...handler.roles)) {
                window.location.hash = '#/home';
                alert('Insufficient permissions');
                return;
            }
            
            this.currentRoute = path;
            handler.callback();
        }
    }

    navigate(path) {
        // Ensure path starts with #
        if (!path.startsWith('#')) {
            path = '#' + path;
        }
        window.location.hash = path;
    }

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.navigate('#/home');
        }
    }
}

const router = new Router();

