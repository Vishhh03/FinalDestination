// Simple Router

const Router = {
    routes: {},
    currentRoute: null,

    // Initialize router
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    },

    // Add route
    add(path, handler) {
        this.routes[path] = handler;
    },

    // Navigate to route
    navigate(path) {
        window.location.hash = path;
    },

    // Handle route change
    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const hashParts = hash.split('/').filter(Boolean);
        
        this.currentRoute = hash;

        // Find matching route
        let handler = null;
        let routeParams = {};
        
        // First try exact match
        handler = this.routes[hash];
        
        // Check for parameterized routes
        if (!handler) {
            for (const [routePath, routeHandler] of Object.entries(this.routes)) {
                if (routePath.includes(':')) {
                    const routeParts = routePath.split('/').filter(Boolean);
                    
                    if (routeParts.length === hashParts.length) {
                        const match = routeParts.every((part, i) => {
                            return part.startsWith(':') || part === hashParts[i];
                        });
                        
                        if (match) {
                            handler = routeHandler;
                            // Extract params
                            routeParts.forEach((part, i) => {
                                if (part.startsWith(':')) {
                                    routeParams[part.slice(1)] = hashParts[i];
                                }
                            });
                            break;
                        }
                    }
                }
            }
        }

        if (handler) {
            try {
                await handler(routeParams);
                Utils.scrollToTop();
            } catch (error) {
                console.error('Route handler error:', error);
                Utils.showToast('An error occurred', 'error');
            }
        } else {
            this.navigate('/');
        }
    },

    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }
};
