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
        const currentPage = window.location.pathname.split('/').pop();
        
        // Check if the current page is a protected route
        if (protectedRoutes.includes(currentPage)) {
            // Check for authentication state in sessionStorage
            const isAuthenticated = sessionStorage.getItem('isAuthenticated');
            if (isAuthenticated !== 'true') {
                console.log('User not authenticated. Redirecting to login.');
                // Use a relative path for robustness
                window.location.href = '1_login.html';
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

