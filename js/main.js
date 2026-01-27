// main.js - Global utilities

/**
 * A self-invoking function to encapsulate global logic and avoid polluting the global scope.
 */
(function() {
    'use strict';

    /**
     * Protects routes that require authentication.
     * Redirects to the login page if the user is not authenticated.
     * @param {string[]} protectedRoutes - An array of page filenames that require authentication.
     */
    function protectRoutes(protectedRoutes) {
        // Get current page from pathname, handling both / and \ path separators
        let currentPage = window.location.pathname.split('/').pop();
        // Handle empty page name (when accessing root or with trailing slash)
        if (!currentPage || currentPage === '') {
            currentPage = 'index.html';
        }
        
        console.log('[Auth] Current page:', currentPage);
        console.log('[Auth] Protected routes:', protectedRoutes);
        
        // Check if the current page is a protected route
        if (protectedRoutes.includes(currentPage)) {
            // Check for authentication state in sessionStorage
            const isAuthenticated = sessionStorage.getItem('isAuthenticated');
            console.log('[Auth] Is authenticated:', isAuthenticated);
            
            if (isAuthenticated !== 'true') {
                console.log('[Auth] User not authenticated. Redirecting to login.');
                // Use a relative path for robustness
                window.location.href = '1_login.html';
                return; // Stop execution to prevent further script loading issues
            } else {
                console.log('[Auth] User authenticated, proceeding with page load.');
            }
        }
    }

    // List of protected pages
    const protectedPages = ['2_dashboard.html', '3_project.html'];
    protectRoutes(protectedPages);

    /**
     * Displays a toast notification.
     * @param {string} message - The message to display.
     * @param {string} type - The type of toast ('info', 'success', 'error'). Defaults to 'info'.
     */
    window.showToast = function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) {
            console.error('Toast container not found!');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // The toast automatically removes itself after the animation duration (4s).
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

})();

