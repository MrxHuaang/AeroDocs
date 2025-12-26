// auth.js - Handles authentication logic

/**
 * A self-invoking function to encapsulate authentication logic.
 */
(function() {
    'use strict';

    // Function to handle login
    function handleLogin() {
        console.log('Simulating Google login...');
        
        // Simulate a successful authentication by setting a flag in sessionStorage.
        // sessionStorage is used because it clears when the browser tab is closed.
        sessionStorage.setItem('isAuthenticated', 'true');
        
        // Redirect to the dashboard upon successful "login".
        window.location.href = '2_dashboard.html';
    }

    // Function to handle logout
    function handleLogout() {
        console.log('Logging out...');
        
        // Clear the authentication flag.
        sessionStorage.removeItem('isAuthenticated');
        
        // Redirect to the login page.
        window.location.href = '1_login.html';
    }

    // Add event listener for the login button if it exists on the current page.
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
    
    // Add event listener for the logout button if it exists on the current page.
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

})();

